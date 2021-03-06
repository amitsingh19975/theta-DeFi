import { Directory, DirectorySerializeType, SerializationType } from './fsInternal/directory';
import File, { FileKind, FileSerializeType } from './fsInternal/file';
import { FileSystem, NodeType } from './fsInternal/fileSystem';
import { BlockAddress } from './block';
import { Path, pathToComponents, ComponentKind } from './path';
import TableFile, { TableFileSerializeType } from './fsInternal/tableFile';
import { TableInfo } from './fsInternal/tableInfo';

export { Directory, File, FileSystem, NodeType, Path };

export const makeDir = (path: string | string[], root?: Directory) => {
    let base = root || Directory.root;
    const comps = pathToComponents(path);
    
    for(const el of comps){
        if(el.kind === ComponentKind.RootDir)
            base = Directory.root;
        else if(el.kind === ComponentKind.CurDir)
            continue;
        else if(el.kind === ComponentKind.ParentDir){
            if(base.parent !== null) base = base.parent;
        }else if(el.kind === ComponentKind.Normal) {
            if(!el.text) return null;
            const child = base.getChild(el.text);
            if(child && child.isDir()) base = child;
            else base = Directory.make(base, el.text);
        }else{
            throw new Error(`unknown component found! [${el.kind} : ${el.text||''}]`)
        }
    }

    return base;
}

export const makeTable = (name: string, fileInfoOrGraphqlSourceCode?: string, blockAddress?: BlockAddress, size?: number, root?: Directory) => {
    name = name.trim();
    if(name.length === 0)
        throw new Error('Filename cannot be empty!');

    const node = root || Directory.root;
    if(name.indexOf('/') >= 0)
        throw new Error("Filename cannot have '/'")

    return TableFile.make(node, name, fileInfoOrGraphqlSourceCode || '', blockAddress, size);
}

export const serializeFileSystem = (root?: Directory) => {
    const node = root || Directory.root;
    return JSON.stringify(node.serialize());
}

export const deserializeDir = (dir: DirectorySerializeType, parent?: Directory) => {
    const ch = dir.children;
    const root = parent || Directory.root;
    let node = Directory.root;
    if (!dir.isRoot) {
        node = Directory.make(null, dir.name);
        root.addChild(node);
    }
    ch.forEach(el => deserializeFileSystem(el, node));
    node.setSizeWithoutUpdatingParent(dir.size);
    
}

export const deserializeFile = (file: FileSerializeType, parent: Directory) => {
    if(file.kind === FileKind.Table){
        const info = TableInfo.deserialize((file.serializedChild as TableFileSerializeType).tableInfo);
        const temp = TableFile.make(null, file.name, info, file.blockAddress, file.size, file.contractAddress);
        parent.addChild(temp);
    }else {
        throw new Error('[File]: unkown file kind found!');
    }
}

export const deserializeFileSystem = (serializedObject: string | SerializationType, parent?: Directory) => {
    const data = (typeof serializedObject === 'string' ? JSON.parse(serializedObject) as SerializationType : serializedObject);
    const node = parent || Directory.root;

    if(data.type === NodeType.Dir){
        const temp = data as DirectorySerializeType;
        deserializeDir(temp, node);
    }else if(data.type === NodeType.File){
        deserializeFile(data as FileSerializeType, node);
    }

    return Directory.root;
}

export const getDirOrFile = (path: string | string[], root?: Directory) =>{
    let base: FileSystem = root || Directory.root;
    const comps = pathToComponents(path);
    
    const len = comps.length;
    let i = 0;
    for(; i < len; ++i){
        const el = comps[i];

        if(el.kind === ComponentKind.RootDir)
            base = Directory.root;
        else if(el.kind === ComponentKind.CurDir)
            continue;
        else if(el.kind === ComponentKind.ParentDir){
            if(base.parent !== null) base = base.parent;
        }else if(el.kind === ComponentKind.Normal) {
            if(!el.text) return null;
            const dir = base.asDir();
            if(dir){
                const child = dir.getChild(el.text);
                if(!child) return null;
                base = child;
            }else {
                break;
            }
        }else{
            throw new Error(`unknown component found! [${el.kind} : ${el.text||''}]`)
        }
    }

    return i === len ? base : null;
}

export const getDir = (path: string | string[], root?: Directory) =>{
    const fs = getDirOrFile(path, root);
    if(fs){
        const dir = fs.asDir();
        return dir ? dir : null;
    }
    return null;
}

export const getFile = (path: string | string[], root?: Directory) =>{
    const fs = getDirOrFile(path, root);
    if(fs){
        const file = fs.asFile();
        return file ? file : null;
    }
    return null;
}

export const getSharedFileSystem = (fs: SerializationType, arr = [] as SerializationType[]) => {
    throw new Error('unimplemented!');
}
