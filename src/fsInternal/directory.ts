import { FileSerializeType } from './file';
import { NodeType, FileSystem } from './fileSystem';

export type SerializationType = DirectorySerializeType | FileSerializeType;

export type DirectorySerializeType = {
    name: string,
    parent: string,
    type: NodeType,
    children: SerializationType[],
    size: number,
    isRoot: boolean,
}

export class Directory extends FileSystem {
    private _children: FileSystem[];

    static #root = new Directory(null, '', true);
    
    private constructor(parent: Directory | null, name: string, isRoot?: boolean) {
        super(parent, name, NodeType.Dir, 0, isRoot);
        this._children = [];
    }
    
    static make(parent: Directory | null, name: string) : Directory{
        return new Directory(parent, name);
    }
    
    get children() : FileSystem[] { return this._children; }
    
    setSizeWithoutUpdatingParent(size: number) : void { this._size = size; }
    
    static get root() : Directory { return this.#root; }

    getChild(childName: string) : FileSystem | null {
        childName = childName.trim();
        if(childName === '/') 
            return Directory.root;
        const el = this._children.find(el => el.name === childName);
        return el ? el : null;
    }

    addChild(child: FileSystem) : FileSystem {
        if(this.isFile()){
            if(this.name === child.name)
                throw new Error(`File['${child.name}'] is already exists`);
            else
                throw new Error(`File['${this.name}'] cannot have children`);
        }

        
        const found = this._children.find((el : FileSystem) => el.name === child.name);
        if(found) return found;
        
        child.parent = this;
        return child;
    }

    removeChild(child: FileSystem) : boolean {
        if(this.isFile())
            return false;
        const index = this._children.indexOf(child);
        if(index < 0) return false;
        
        child.parent = null;
        this._children.splice(index, 1);
        return true;
    }

    removeChildAt(idx: number) : boolean {
        if (idx < 0 || idx >= this.children.length) return false;
        if(this.isFile())
            return false;        
        const child = this.children[idx];
        child.asDir()?.removeAll();
        this._children.splice(idx, 1);
        return true;
    }

    addChildren(children: FileSystem[]) {
        for(const c of children){
            this.addChild(c);
        }
    }

    removeChildren(children: FileSystem[]) {
        for(const c of children){
            this.removeChild(c);
        }
    }

    removeAll() : void {
        const len = this.children.length;
        for(let i = 0; i < len; ++i){
            const el = this.children[i];
            const dir = el.asDir();
            if(dir){
                dir.removeAll();
                dir._children = [];
            }
        }
        this._children = [];
    }

    serialize() : DirectorySerializeType {
        return {
            name: this.name,
            parent: this.parent ? this.parent.name : '',
            type: NodeType.Dir,
            children: this.children.map(el => el.serialize()),
            size: this.size,
            isRoot: this.isRoot(),
        }
    }
}