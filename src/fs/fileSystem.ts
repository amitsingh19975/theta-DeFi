import { Directory, SerializationType } from "./directory";
import File from "./file";

export enum NodeType{
    None,
    File,
    Dir,
}

export class FileSystem {
    private _name: string;
    private _parent: FileSystem | null;
    private _type: NodeType;
    protected _size: number;

    constructor(parent: Directory | null, name: string, type: NodeType, size?: number, isRoot?: boolean){
        name = name.trim();
        if(!isRoot && name.length === 0)
            throw new Error("Filename cannot be empty");
        this._name = name;
        this._parent = parent;
        this._type = type;
        this._size = size || 0;

        if(parent){
            if(parent.getChild(this._name) && type === NodeType.File)
                throw new Error(`File['${this._name}'] already exists!`);
            parent.asDir()?.children.push(this);
            parent.addSizeUsingNode(this);
        }
    }

    private setNewParent(np: Directory | null) : void {
        if(np === null) 
            return;
        if(np.isFile()){
            throw new Error('File cannot have children');
        }
        const oldParent = this._parent;
        if(oldParent === null){
            this._parent = np;
            np.addSizeUsingNode(this);
            np.children.push(this);
            return;
        }

        const children = oldParent.asDir()?.children;
        
        let index = 0;
        const el = children?.find((el,i) => {
            index = i;
            return el.name === this.name
        });

        if(el){
            children?.splice(index, 1);
            np.children.push(this);
        }else{
            throw new Error("Invalid parent-child relationship");
        }
        this._parent?.removeSizeUsingNode(this);
        this._parent = np;
        np.addSizeUsingNode(this);
    }

    private setSize(fn : (size: number) => number) : void {
        this._size = fn(this._size);
        if(this.parent !== null){
            this.parent.setSize(fn);
        }
    }

    protected addSizeUsingNode(node: FileSystem | null) : void{
        if(node === null) return;
        const size = node.size;
        this.setSize(s => s + size);
    }
    
    protected removeSizeUsingNode(node: FileSystem | null) : void{
        if(node === null) return;
        const size = node.size;
        this.setSize(s => s - size);
    }

    get name() : string { return this._name; }
    set name(newName: string) { this._name = newName; }

    get parent() : Directory | null { return this._parent? this._parent.asDir() : null; }
    set parent(newParent: Directory | null) { this.setNewParent(newParent); }

    get type() : NodeType { return this._type; }

    get size() : number { return this._size; }
    set size(size: number) {
        this.removeSizeUsingNode(this);
        this.setSize(s => s + size);
    }

    forEach(fn : (node : FileSystem) => void ) : void {
        fn(this);
        this.forEachHelper(this, fn);
    }
    
    private forEachHelper(root: FileSystem, fn : (node : FileSystem) => void ) : void {
        if(root === null || root.isFile()) return;
        const dir = root.asDir();
        if(dir){
            for(const node of dir.children){
                fn(node);
                this.forEachHelper(node, fn);
            }
        }
    }

    isDir() : this is Directory { return this.type === NodeType.Dir; }
    isFile() : this is File { return this.type === NodeType.File; }

    asDir() : Directory | null {
        if(this.isDir()) return this as Directory;
        else return null;
    }
    
    asFile() : File | null {
        if(this.isFile()) return this as File;
        else return null;
    }

    isRoot() : boolean { return this.isDir() && this.name === '' && this.parent === null; }

    asNode() : FileSystem { return this as FileSystem; }

    isEqual(node: FileSystem, strict = false) : boolean {
        if(this === node || this.parent === null && node.parent === null)
            return true;
        else if( this.parent === null || node.parent === null )
            return false;
        else
            return (this.type === node.type || !strict) && (this.name === node.name) && this.parent.isEqual(node.parent, strict); 
    }

    serialize() : SerializationType {
        return this.serializeHelper({} as SerializationType);
    }

    private serializeHelper(json : SerializationType) : SerializationType {
        const dir = this.asDir();
        const file = this.asFile();

        if(dir) return dir.serialize();
        else if(file) return file.serialize();
        return json;
    }
}
