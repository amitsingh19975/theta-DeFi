import { Directory } from "./directory";
import { NodeType } from "./fileSystem";
import { TableInfo as TableInfo } from "./tableInfo";
import { TableInfoInterface } from "./tableInfo";
import { BlockDataType, MAX_BLOCK_SIZE } from "../edgeStore";
import { AcceptableType } from "./types";
import { BlockManager } from "../blockManager";
import { buildSchema, GraphQLSchema } from "graphql";
import { Block, BlockAddress, BlockType } from "../block";
import { Path } from "../fs";
import File, { FileKind, FileSerializeType } from "./file";

export type TableFileSerializeType = {
    tableInfo: TableInfoInterface,
}

export type FieldsType = {
    name: string,
    type: string,
    description: string,
}

export type TableMetadataType = {
    description: string,
    path: string,
    name: string,
    size: number,
    source: string,
    height: number,
    fields: [FieldsType]
}

type GraphQLResolverFnType = ((args?: BlockType | {input: BlockType}) => GraphQLResolverReturnType);

type GraphQLResolverReturnType = AcceptableType | BlockDataType | TableMetadataType | Promise<AcceptableType|BlockDataType|void|TableMetadataType> | void;
type GraphQLResolverType = { [key: string|symbol] : GraphQLResolverFnType };

const mapBlocks = (blocks: Block[]) => {
    const res = [] as BlockDataType;
    blocks.map(block => block.forEach(el => res.push(el)));
    return res;
}

export const buildArgsFromFields = (fileInfo: TableInfo, sep = ', ') => {
    const args = [] as string[];
    fileInfo.forEach(el => args.push(el.name + ': ' + el.type.toString()));
    return args.join(sep);
}

export const buildInputType = (fileInfo: TableInfo) => {
    const typeName = fileInfo.tableName + 'Input';
    return [typeName, `
input ${typeName} { 
\t${buildArgsFromFields(fileInfo, '\n\t')}
}
    `]
}

export default class TableFile extends File {
    private _tableInfo : TableInfo;
    private _height = 0;
    private _manager? : BlockManager;

    private constructor(parent: Directory | null, name: string, fileInfo: TableInfo, blockAddress: BlockAddress, bufferSize: number, contractAddress: BlockAddress) {
        super(parent, name, blockAddress, bufferSize, FileKind.Table, contractAddress);
        this._tableInfo = fileInfo;
        this._height = this._manager?.height || 0;
    }
    
    static make(parent: Directory | null, name: string, fileInfoOrGraphqlSourceCode: TableInfo | string, blockAddress?: BlockAddress, bufferSize?: number, contractAddress?: BlockAddress) : TableFile {
        if(fileInfoOrGraphqlSourceCode instanceof TableInfo){
            return new TableFile(parent, name, fileInfoOrGraphqlSourceCode, blockAddress||null, bufferSize || 0, contractAddress || null);
        }else{
            return new TableFile(parent, name, TableInfo.fromGraphQLSource(fileInfoOrGraphqlSourceCode), blockAddress||null, bufferSize || 0, contractAddress || null);
        }
    }

    async init() : Promise<void> {
        this._manager = await BlockManager.make(this.contractAddress, this.keys, this.blockAddress);
    }

    get tableInfo() : TableInfo { return this._tableInfo; }
    get tableName() : string { return this._tableInfo.tableName; }
    get keys() : string[] { return this._tableInfo.keys; }
    get height() : number { return this._height; }
    get currentBlocks(): Block[] { return this._manager?.getBlocks() || []}

    private makeGraphQLMutationResolver(resolver: GraphQLResolverType) : void {
        resolver['addRow'] = async (args) => {
            if(!args) throw new Error('[resolver] => arguments are undefined!');

            if(!('input' in args)){
                throw new Error('"input" parameter not found');
            }
            const arr = this._tableInfo.buildRow(args['input'] as unknown as BlockType);
            const manager = this._manager;
            if(!manager) throw new Error('[Table]: block manager is not initialized');
            const res = await manager.pushRow(arr, true, (size) => this.size += size);
            if(!res){
                throw new Error(`["addRow"] => unable to add row into the database('${this.tableName}')`)
            }

            this._initialBlockAddress = manager.initialAddress ? manager.initialAddress : this._initialBlockAddress;
            this._height = manager.height;
            return true;
        }

        resolver['commit'] = async () => {
            const manager = this._manager;
            if(!manager) throw new Error('[Table]: block manager is not initialized');

            const res = await manager.commit((size) => this.size += size);
            this._height = manager.height;
            return res;
        }
    }

    getInfo() : TableMetadataType {
        const manager = this._manager;
        if(!manager) throw new Error('[Table]: block manager is not initialized');

        this._height = manager.height;

        const fields = [] as FieldsType[];

        this._tableInfo.forEach(field => fields.push({
            name: field.name,
            type: field.type.toString(),
            description: field.description
        }));

        return {
            description: this._tableInfo.description,
            name: this.tableName,
            size: this.size,
            source: this._tableInfo.source,
            height: this.height,
            fields: fields,
            path: Path.getPath(this)
        } as TableMetadataType;
    }

    makeGraphQLResolver() : GraphQLResolverType {
        const resolver = {} as GraphQLResolverType;
        resolver[this.name] = () => {
            const manager = this._manager;
            if(!manager) throw new Error('[Table]: block manager is not initialized');
            return mapBlocks(manager.getBlocks());
        }

        resolver['loadChunk'] = async (args) => {
            if(!args) throw new Error('[resolver] => arguments are undefined!');
            
            let start = 0;
            let end = MAX_BLOCK_SIZE;

            if('start' in args) start = args['start'] as number;
            
            if('end' in args) end = args['end'] as number;
            const manager = this._manager;
            if(!manager) throw new Error('[Table]: block manager is not initialized');

            await manager.loadChunkFromInitialAddress(start, end);
            return mapBlocks(manager.getBlocks());
        }

        resolver['info'] = () => {
            return this.getInfo();
        };
        this.makeGraphQLMutationResolver(resolver);
        return resolver;
    }

    makeGraphQLSchema() : GraphQLSchema {
        const input = buildInputType(this._tableInfo);
        return buildSchema(`
            ${this._tableInfo.source}

            ${input[1]}

            type Mutation {
                addRow(input: ${input[0]}!) : Boolean!
                commit : Boolean!
            }

            type Fields {
                name: String!
                type: String!
                description: String!
            }
            
            type Info {
                description: String!
                path: String!
                name: String!
                size: Int!
                source: String!
                height: Int!
                fields: [Fields]
            }

            type Query {
                info : Info
                loadChunk(start: Int, end: Int): [${this.tableName}]
                ${this.tableName[0].toLowerCase() + this.tableName.substring(1)} : [${this.tableName}]
            }
        `);
    }

    get basename() : string {
        return this.name.split('.')[0];
    }
    
    get extension() : string {
        const arr = this.name.split('.');
        return arr.length === 2 ? (arr.pop() || '') : '';
    }

    static deserialize(file: FileSerializeType) : File {
        const info = TableInfo.deserialize((file.serializedChild as TableFileSerializeType).tableInfo);
        const temp = TableFile.make(null, file.name, info, file.blockAddress, file.size, file.contractAddress);
        return temp;
    }

    serialize() : FileSerializeType {
        const tableInfo: TableInfoInterface = this._tableInfo.serialize();
        const size = this.size;
        
        return {
            name: this.name,
            parent: this.parent ? this.parent.name : '',
            type: NodeType.File,
            size,
            kind: this.kind,
            blockAddress: this._initialBlockAddress,
            serializedChild: {
                tableInfo
            },
            contractAddress: this._contractAddress,
        };
    }

}