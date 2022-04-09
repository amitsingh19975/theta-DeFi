"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _a, _Directory_root;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Directory = void 0;
const fileSystem_1 = require("./fileSystem");
class Directory extends fileSystem_1.FileSystem {
    constructor(parent, name, isRoot) {
        super(parent, name, fileSystem_1.NodeType.Dir, 0, isRoot);
        this._children = [];
    }
    static make(parent, name) {
        return new Directory(parent, name);
    }
    get children() { return this._children; }
    setSizeWithoutUpdatingParent(size) { this._size = size; }
    static get root() { return __classPrivateFieldGet(this, _a, "f", _Directory_root); }
    getChild(childName) {
        childName = childName.trim();
        if (childName === '/')
            return Directory.root;
        const el = this._children.find(el => el.name === childName);
        return el ? el : null;
    }
    addChild(child) {
        if (this.isFile()) {
            if (this.name === child.name)
                throw new Error(`File['${child.name}'] is already exists`);
            else
                throw new Error(`File['${this.name}'] cannot have children`);
        }
        const found = this._children.find((el) => el.name === child.name);
        if (found)
            return found;
        child.parent = this;
        return child;
    }
    removeChild(child) {
        if (this.isFile())
            return false;
        const index = this._children.indexOf(child);
        if (index < 0)
            return false;
        child.parent = null;
        this._children.splice(index, 1);
        return true;
    }
    addChildren(children) {
        for (const c of children) {
            this.addChild(c);
        }
    }
    removeChildren(children) {
        for (const c of children) {
            this.removeChild(c);
        }
    }
    removeAll() {
        const len = this.children.length;
        for (let i = 0; i < len; ++i) {
            const el = this.children[i];
            const dir = el.asDir();
            if (dir) {
                dir.removeAll();
                dir._children = [];
            }
        }
        this._children = [];
    }
    serialize() {
        return {
            name: this.name,
            parent: this.parent ? this.parent.name : '',
            type: fileSystem_1.NodeType.Dir,
            children: this.children.map(el => el.serialize()),
            size: this.size,
        };
    }
}
exports.Directory = Directory;
_a = Directory;
_Directory_root = { value: new Directory(null, '', true) };
//# sourceMappingURL=directory.js.map