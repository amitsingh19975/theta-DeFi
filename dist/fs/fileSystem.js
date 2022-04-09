"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileSystem = exports.NodeType = void 0;
var NodeType;
(function (NodeType) {
    NodeType[NodeType["None"] = 0] = "None";
    NodeType[NodeType["File"] = 1] = "File";
    NodeType[NodeType["Dir"] = 2] = "Dir";
})(NodeType = exports.NodeType || (exports.NodeType = {}));
class FileSystem {
    constructor(parent, name, type, size, isRoot) {
        var _a;
        name = name.trim();
        if (!isRoot && name.length === 0)
            throw new Error("Filename cannot be empty");
        this._name = name;
        this._parent = parent;
        this._type = type;
        this._size = size || 0;
        if (parent) {
            if (parent.getChild(this._name) && type === NodeType.File)
                throw new Error(`File['${this._name}'] already exists!`);
            (_a = parent.asDir()) === null || _a === void 0 ? void 0 : _a.children.push(this);
            parent.addSizeUsingNode(this);
        }
    }
    setNewParent(np) {
        var _a, _b;
        if (np === null)
            return;
        if (np.isFile()) {
            throw new Error('File cannot have children');
        }
        const oldParent = this._parent;
        if (oldParent === null) {
            this._parent = np;
            np.addSizeUsingNode(this);
            np.children.push(this);
            return;
        }
        const children = (_a = oldParent.asDir()) === null || _a === void 0 ? void 0 : _a.children;
        let index = 0;
        const el = children === null || children === void 0 ? void 0 : children.find((el, i) => {
            index = i;
            return el.name === this.name;
        });
        if (el) {
            children === null || children === void 0 ? void 0 : children.splice(index, 1);
            np.children.push(this);
        }
        else {
            throw new Error("Invalid parent-child relationship");
        }
        (_b = this._parent) === null || _b === void 0 ? void 0 : _b.removeSizeUsingNode(this);
        this._parent = np;
        np.addSizeUsingNode(this);
    }
    setSize(fn) {
        this._size = fn(this._size);
        if (this.parent !== null) {
            this.parent.setSize(fn);
        }
    }
    addSizeUsingNode(node) {
        if (node === null)
            return;
        const size = node.size;
        this.setSize(s => s + size);
    }
    removeSizeUsingNode(node) {
        if (node === null)
            return;
        const size = node.size;
        this.setSize(s => s - size);
    }
    get name() { return this._name; }
    set name(newName) { this._name = newName; }
    get parent() { return this._parent ? this._parent.asDir() : null; }
    set parent(newParent) { this.setNewParent(newParent); }
    get type() { return this._type; }
    get size() { return this._size; }
    set size(size) {
        this.removeSizeUsingNode(this);
        this.setSize(s => s + size);
    }
    forEach(fn) {
        fn(this);
        this.forEachHelper(this, fn);
    }
    forEachHelper(root, fn) {
        if (root === null || root.isFile())
            return;
        const dir = root.asDir();
        if (dir) {
            for (const node of dir.children) {
                fn(node);
                this.forEachHelper(node, fn);
            }
        }
    }
    isDir() { return this.type === NodeType.Dir; }
    isFile() { return this.type === NodeType.File; }
    asDir() {
        if (this.isDir())
            return this;
        else
            return null;
    }
    asFile() {
        if (this.isFile())
            return this;
        else
            return null;
    }
    isRoot() { return this.isDir() && this.name === '' && this.parent === null; }
    asNode() { return this; }
    isEqual(node, strict = false) {
        if (this === node || this.parent === null && node.parent === null)
            return true;
        else if (this.parent === null || node.parent === null)
            return false;
        else
            return (this.type === node.type || !strict) && (this.name === node.name) && this.parent.isEqual(node.parent, strict);
    }
    serialize() {
        return this.serializeHelper({});
    }
    serializeHelper(json) {
        const dir = this.asDir();
        const file = this.asFile();
        if (dir)
            return dir.serialize();
        else if (file)
            return file.serialize();
        return json;
    }
}
exports.FileSystem = FileSystem;
//# sourceMappingURL=fileSystem.js.map