import { BlockAddress } from "../block";
import { Directory, FileSystem, File, Path } from "../fs";
import { cd } from "./cd";

export type FileInfo = {
    isFile: boolean,
    size: number,
    name: string,
    parent: string,
    baseAddress: BlockAddress,
    fullPath: string,
};

const addFInfo = (file : File) => {
    return {
        name: file.name,
        parent: file.parent?.name,
        size: file.size,
        isFile: true,
        fullPath: Path.getPath(file),
    } as FileInfo
}

const addDInfo = (dir : Directory) => {
    return {
        name: dir.name,
        parent: dir.parent?.name,
        size: dir.size,
        isFile: false,
        fullPath: Path.getPath(dir),
    } as FileInfo
}

const getNodeInfo = (node: FileSystem) => {
    const infos = [] as FileInfo[];
    const dir = node.asDir();
    const file = node.asFile();
    if(file) {
        infos.push(addFInfo(file));
    }else if(dir){
        for(const c of dir.children){
            const cf = c.asFile();
            const cd = c.asDir();
            if(cf) infos.push(addFInfo(cf));
            else if(cd) infos.push(addDInfo(cd));
        }
    }
    return infos;
}

export const ls = (currNode: Directory, path: string | string[]) =>{
    const dir = cd(path, currNode);
    if(!dir) return [] as FileInfo[];
    return getNodeInfo(dir);
}
