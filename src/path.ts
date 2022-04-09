import { Directory } from './fsInternal/directory';
import { FileSystem } from './fsInternal/fileSystem';

export enum ComponentKind {
    RootDir,
    CurDir,
    ParentDir,
    Normal,
}

type Component = {
    kind: ComponentKind,
    text?: string
}

export const pathToComponentsHelper = (path: string[]) => {
    const comps = [] as Component[];
    const len = path.length;

    for(let i = 0; i < len; i++){
        const el = path[i];

        if(i === 0 && el.length === 0)
            comps.push({kind: ComponentKind.RootDir});
        else if(el.length === 0)
            continue;
        else if(el === '.')
            comps.push({kind: ComponentKind.CurDir});
        else if(el === '..')
            comps.push({kind: ComponentKind.ParentDir});
        else
            comps.push({kind: ComponentKind.Normal, text: el});
    }
    
    return comps;
}

export const pathToComponents = (path: string|string[]) => {
    return pathToComponentsHelper(
        Array.isArray(path) ? 
            path.map(el => el.trim()) : 
            path.trim().split('/').map(el => el.trim())
    );
}

export class Path {
    static exists(path: string | string[], root?: Directory) : boolean {
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
                if(!el.text) return false;
                if(base.getChild(el.text) === null) return false;
            }else{
                throw new Error(`unknown component found! [${el.kind} : ${el.text||''}]`)
            }
        }

        return true;
    }
    
    static getPath(fs: FileSystem) : string {
        const arr : string[] = [];
        let root: FileSystem | null = fs;
        while( root !== null ){
            arr.push(root.name);
            root = root.parent;
        }
        return arr.reverse().join('/');
    }

    static samePath(leftFS: FileSystem | string, rightFS: FileSystem | string, strict = false) : boolean {
        if(leftFS === null || rightFS === null)
            return false;
        if(typeof leftFS === 'string' && typeof rightFS === 'string'){
            return this.samePathSS(leftFS, rightFS);
        }else if(typeof leftFS === 'string' && typeof rightFS !== 'string'){
            return this.samePathSF(leftFS, rightFS);
        }else if(typeof leftFS !== 'string' && typeof rightFS === 'string'){
            return this.samePathFS(leftFS, rightFS);
        }else{
            return this.samePathFF(leftFS as FileSystem, rightFS as FileSystem, strict);
        }
    }

    private static samePathFF(leftFS: FileSystem, rightFS: FileSystem, strict: boolean) : boolean {
        return leftFS.isEqual(rightFS, strict);
    }

    private static samePathSS(leftFS: string, rightFS: string) : boolean {
        return leftFS === rightFS;
    }
    
    private static samePathSF(leftFS: string, rightFS: FileSystem) : boolean {
        return this.samePathSS(leftFS, this.getPath(rightFS));
    }
    
    private static samePathFS(leftFS: FileSystem, rightFS: string) : boolean {
        return this.samePathSS(this.getPath(leftFS), rightFS);
    }
}
