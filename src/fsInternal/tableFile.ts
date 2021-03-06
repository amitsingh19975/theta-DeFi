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

type GraphQLResolverFnType = ((args?: Record<string, unknown>) => GraphQLResolverReturnType);

type GraphQLResolverReturnType = AcceptableType | BlockDataType | TableMetadataType | Promise<AcceptableType|BlockDataType|void|TableMetadataType> | void;
type GraphQLResolverType = { [key: string|symbol] : GraphQLResolverFnType };

const mapBlocks = (blocks: Block[]) => {
    const res = [] as BlockDataType;
    blocks.map(block => block.forEach(el => res.push(el)));
    return res;
}

export const buildArgsFromFields = (fileInfo: TableInfo, sep = ', ') => {
    const args = [] as string[];
    fileInfo.forEach(el => args.push(el.name + ': ' + el.type.toStr()));
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

export type GraphQLExecArgsType = {
    funcName: string,
    args?: unknown,
    type: 'Mutation'|'Query'
};

export type GraphQLExecCallbackType = (args: GraphQLExecArgsType) => void;

export default class TableFile extends File {
    private _tableInfo : TableInfo;
    private _height = 0;
    private _manager? : BlockManager;
    _callbackAfter?: GraphQLExecCallbackType;
    _callbackBefore?: GraphQLExecCallbackType;
    _committedCallback?: () => void;

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

    async init(numberOfCacheBlocks = 3) : Promise<void> {
        this._manager = await BlockManager.make(this.contractAddress, this.keys, this.blockAddress, numberOfCacheBlocks);
    }

    setCallbackAfter(callback: GraphQLExecCallbackType) : void { this._callbackAfter = callback; }
    setCallbackBefore(callback: GraphQLExecCallbackType) : void { this._callbackBefore = callback; }
    setCommittedCallback(callback: () => void) : void { this._committedCallback = callback; }

    get approxSize() : number { return this._size + (this._manager?.tempSize || 0); }

    get tableInfo() : TableInfo { return this._tableInfo; }
    get tableName() : string { return this._tableInfo.tableName; }
    get keys() : string[] { return this._tableInfo.keys; }
    get height() : number { return this._height; }
    get currentBlocks(): Block[] { return this._manager?.getBlocks() || []}
    get rows(): Record<string, unknown>[] { return this._manager?.getData() || [] }

    private async _pushRow(manager: BlockManager, args: BlockType) : Promise<void> {
        const arr = this._tableInfo.buildRow(args);
        const res = await manager.pushRow(arr, true, () => {
            this._size += this._manager?.tempSize || 0
            if (this._committedCallback) this._committedCallback();
        });

        if(!res){
            throw new Error(`["addRow"] => unable to add row into the database('${this.tableName}')`)
        }
        
        this._initialBlockAddress = manager.initialAddress ? manager.initialAddress : this._initialBlockAddress;
        this._height = manager.height;
    }

    private makeGraphQLMutationResolver(resolver: GraphQLResolverType) : void {
        resolver['addRow'] = async (args) => {
            if(!args) throw new Error('[resolver] => arguments are undefined!');
            
            const input = args.input as BlockType;

            if(typeof input === 'undefined'){
                throw new Error('[addRow] => "input" parameter not found');
            }
            
            const manager = this._manager;
            if(!manager) throw new Error('[Table]: block manager is not initialized');

            if (this._callbackBefore) this._callbackBefore({funcName: 'addRow', args: args['input'], type: 'Mutation'});

            await this._pushRow(manager, input);

            if (this._callbackAfter) this._callbackAfter({funcName: 'addRow', args: args['input'], type: 'Mutation'});

            return true;
        }
        
        resolver['addRows'] = async (args) => {
            if(!args) throw new Error('[resolver] => arguments are undefined!');

            const inputs = args.input as unknown as BlockType[];

            if(typeof inputs === 'undefined'){
                throw new Error('[addRows] => "input" parameter not found');
            }
            
            if(!Array.isArray(inputs)){
                throw new Error('[addRows] => "input" parameter must be an array');
            }

            const manager = this._manager;
            if(!manager) throw new Error('[Table]: block manager is not initialized');

            if (this._callbackBefore) this._callbackBefore({funcName: 'addRows', args: inputs, type: 'Mutation'});

            for (let i = 0; i < inputs.length; i += 1) {
                const el = inputs[i];
                await this._pushRow(manager, el);
            }

            if (this._callbackAfter) this._callbackAfter({funcName: 'addRows', args: inputs, type: 'Mutation'});

            return true;

        }

        resolver['commit'] = async () => {
            const manager = this._manager;
            if(!manager) throw new Error('[Table]: block manager is not initialized');

            if (this._callbackBefore) this._callbackBefore({funcName: 'commit', type: 'Mutation'});

            const res = await manager.commit(() => {
                this._size += this._manager?.tempSize || 0
                if (this._committedCallback) this._committedCallback();
            });
            
            if (this._callbackAfter) this._callbackAfter({funcName: 'commit', type: 'Mutation'});

            this._initialBlockAddress = manager.initialAddress ? manager.initialAddress : this._initialBlockAddress;
            this._height = manager.height;
            return res;
        }
    }

    parseTypes(data: Record<string, unknown>): Record<string, unknown> {
        const res = {} as Record<string, unknown>;
        for(const k in data) {
            res[k] = this._tableInfo.parseType(k, data[k]);
        }

        return res;
    }

    getInfo() : TableMetadataType {
        const manager = this._manager;
        if(manager) this._height = manager.height;


        const fields = [] as FieldsType[];

        this._tableInfo.forEach(field => fields.push({
            name: field.name,
            type: field.type.toStr(),
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
        resolver['show'] = () => {
            const manager = this._manager;
            if(!manager) throw new Error('[Table]: block manager is not initialized');
            
            if (this._callbackBefore) this._callbackBefore({funcName: 'show', type: 'Query'});

            const res = mapBlocks(manager.getBlocks());

            if (this._callbackAfter) this._callbackAfter({funcName: 'show', type: 'Query'});

            return res;
        }

        resolver['loadChunk'] = async (args) => {
            if(!args) throw new Error('[resolver] => arguments are undefined!');
            
            let start = 0;
            let size = Number.MAX_VALUE;

            if('start' in args) start = args['start'] as number;
            
            if('size' in args) size = args['size'] as number;
            const manager = this._manager;
            if(!manager) throw new Error('[Table]: block manager is not initialized');
            
            if (this._callbackBefore) this._callbackBefore({funcName: 'loadChunk', args: { start, size }, type: 'Query'});
            
            await manager.loadChunkFromInitialAddress(start, size);

            if (this._callbackAfter) this._callbackAfter({funcName: 'loadChunk', args: { start, size }, type: 'Query'});

            return mapBlocks(manager.getBlocks());
        }

        resolver['info'] = () => {
            if (this._callbackBefore) this._callbackBefore({funcName: 'info', type: 'Query'});
            
            const res = this.getInfo();
            
            if (this._callbackAfter) this._callbackAfter({funcName: 'info', type: 'Query'});

            return res;
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
                addRows(input: [${input[0]}!]!) : Boolean!
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
                loadChunk(start: Int, size: Int): [${this.tableName}]
                show : [${this.tableName}]
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
