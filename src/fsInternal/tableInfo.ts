import { Int, Float, Str, Bool, BasicType, AcceptableType } from './types';
import { parse, visit, TypeNode, NameNode, Kind, NamedTypeNode, TokenKind, DefinitionNode, DocumentNode } from 'graphql';
import { BlockType } from '../block';

export { Int, Float, Str, Bool }

type MapType = (data: AcceptableType) => AcceptableType;
type FilterType = (data: AcceptableType) => boolean;

export type FieldType = {
    name: string,
    type: BasicType,
    description?: string,
    map?: MapType,
    filter?: FilterType
}

type InternalFieldType = {
    name: string,
    type: BasicType,
    description: string,
    map: MapType,
    filter: FilterType
}

const checkIfMoreThanOneDefination = (node: readonly DefinitionNode[]) => {
    let count = 0;
    for(const el of node){
        if(el.kind === Kind.OBJECT_TYPE_DEFINITION) ++count;
    }
    return count === 1;
}

const getDefinationNode = (node: DocumentNode) => {
    for(const el of node.definitions){
        if(el.kind === Kind.OBJECT_TYPE_DEFINITION) return el;
    }
    return null
}

export const defaultMapFn = (data: AcceptableType) => {
    if(Array.isArray(data)){
        return data.map(defaultMapFn);
    }else if(typeof data === 'string'){
        return data.trim();
    }else if(typeof data === 'boolean'){
        return data ? true : false;
    }else{
        return data;
    }
}

export const defaultFilterFn = () => true;

const constructInternalFieldType = (f: FieldType) => {
    return {
        name: f.name.trim(),
        type: f.type,
        description: f.description?.trim() || '',
        map: f.map || defaultMapFn,
        filter: f.filter || defaultFilterFn
    } as InternalFieldType;
}

export type TableInfoInterface = {
    tableName: string,
    fields: InternalFieldType[],
    source: string,
    description: string,
}

export class TableInfo{
    private fields: InternalFieldType[] = [];
    readonly source: string;
    description: string;

    constructor(readonly tableName: string, source?: string, description?: string, fields?: FieldType[]){
        fields && fields.forEach(el => this.fields.push(constructInternalFieldType(el)))
        this.description = description?.trim() || '';
        this.source = source || '';
    }

    getField(name: string) : InternalFieldType | null {
        name = name.trim();
        const f = this.fields.find(el => el.name === name);
        return f ? f : null;
    }

    addField(field: FieldType): boolean {
        if(this.getField(field.name))
            return false;

        this.fields.push(constructInternalFieldType(field));
        return true;
    }

    get keys() : string[] {
        return this.fields.map(el => el.name).sort();
    }

    forEach(callback: (el: InternalFieldType, idx: number, arr: InternalFieldType[]) => void) : void {
        this.fields.forEach(callback);
    }

    validateType(name: string, data: AcceptableType, callback: (valid: boolean, dataAfterMapping: AcceptableType, err?: string) => void) : void{
        const f = this.getField(name);
        if(!f) {
            callback(false, data, `field["${name}"] not found!`);
        }else {
            const mdata = f.map(data);
            if( f.filter(mdata) ){
                const [valid, err] = f.type.checkConstraints(mdata);
                callback(valid, mdata, valid ? undefined : err);
            }
        }
    }

    buildRow(args: BlockType) : BlockType {
        const result = {} as BlockType;
        
        this.fields.forEach(f => {
            const name = f.name;
            if(name in args){
                const el = args[name];
                const mdata = f.map(el);
                if( f.filter(mdata) ){
                    const [valid, err] = f.type.checkConstraints(mdata);
                    if(!valid)
                        throw new Error(`[${name} : ${f.type.toString()}] => type constraints are not satisfied! ${err}`);
                    else
                        result[name] = mdata;
                }
            }else{
                if(f.type.canBeNull()){
                    result[name] = null;
                }else{
                    throw new Error(`[${name} : ${f.type.toString()}] => Field cannot be skipped or null`);
                }
            }
        });

        return result;
    }

    updateMapFn(name: string, map: MapType): boolean {
        const f = this.getField(name);
        if(!f) return false;
        f.map = map;
        return true;
    }

    updateFilterFn(name: string, filter: FilterType): boolean {
        const f = this.getField(name);
        if(!f) return false;
        f.filter = filter;
        return true;
    }

    // private removeFieldData(index: number) : void {
    //     // TODO: Remove the field data;
    // }

    // removeAll() : void {
    //     this.fields.forEach((_, idx) => this.removeFieldData(idx));
    // }

    // removeField(name: string) : boolean {
    //     let idx = -1;
    //     this.fields.find((el, i) => idx = (el.name === name ? i : -1));
    //     if(idx < 0)
    //         return false;
        
    //     this.removeFieldData(idx);
    //     this.fields = this.fields.splice(idx,1);
    //     return true;
    // }

    static fromGraphQLSource(source: string) : TableInfo {
        try{
            const fields = [] as FieldType[];
            let name = '';
            let description: string | undefined;
            
            const ast = parse(source);

            const definitionNode = getDefinationNode(ast);
            
            if( !checkIfMoreThanOneDefination(ast.definitions) ){
                throw new Error('There can be only one Object Definition; no less, no more!');
            }
            
            if(definitionNode === null) 
                throw new Error('No defination node found');

            visit(definitionNode, {
                ObjectTypeDefinition(node){
                    name = node.name.value;
                    description = node.description?.value;
                },
                FieldDefinition(node){
                    const f = {
                        name: node.name.value,
                        type: mapType(node.type),
                        description: node.description?.value
                    } as FieldType;
                    fields.push(f);
                }
            });
    
            return new TableInfo(name, source, description, fields);
        }catch(e){
            throw new Error(`[Error while parsing GraphQL] => ${e}`);
        }
    }

    serialize() : TableInfoInterface {
        return {
            fields: this.fields,
            source: this.source,
            description: this.description,
        } as TableInfoInterface;
    }

    static deserialize(json: TableInfoInterface) : TableInfo {
        return new TableInfo(json.tableName, json.source, json.description, json.fields);
    }
}

const matchType = (node: NameNode, value: string) => node.value === value;

const mapTypeHelper = (type: NamedTypeNode, arrD: number, canBeNull: boolean[]) => {
    const makeType = (t : (n : boolean[], d: number) => BasicType) => t(canBeNull.reverse(), arrD);
    if(matchType(type.name, TokenKind.FLOAT))
        return makeType(Float);
    else if(matchType(type.name, TokenKind.INT))
        return makeType(Int);
    else if(matchType(type.name, TokenKind.STRING))
        return makeType(Str);
    else if(matchType(type.name, 'Boolean'))
        return makeType(Bool);
    else
        throw new Error('Unsupported Type!');
}

const mapType = (type: TypeNode, arrD = 0, canBeNull = [] as boolean[], shouldPush = true) => {
    const isNonNull = type.kind === Kind.NON_NULL_TYPE;
    if(shouldPush){
        canBeNull.push(!isNonNull);
    }

    if(type.kind === Kind.NAMED_TYPE){
        return mapTypeHelper(type, arrD, canBeNull);
    }else if(type.kind === Kind.LIST_TYPE){
        return mapType(type.type, arrD + 1, canBeNull);
    }else if(type.kind === Kind.NON_NULL_TYPE){
        return mapType(type.type, arrD, canBeNull, false);
    }
}