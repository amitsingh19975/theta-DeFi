"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Path = exports.pathToComponents = exports.pathToComponentsHelper = exports.ComponentKind = void 0;
const directory_1 = require("./fs/directory");
var ComponentKind;
(function (ComponentKind) {
    ComponentKind[ComponentKind["RootDir"] = 0] = "RootDir";
    ComponentKind[ComponentKind["CurDir"] = 1] = "CurDir";
    ComponentKind[ComponentKind["ParentDir"] = 2] = "ParentDir";
    ComponentKind[ComponentKind["Normal"] = 3] = "Normal";
})(ComponentKind = exports.ComponentKind || (exports.ComponentKind = {}));
const pathToComponentsHelper = (path) => {
    const comps = [];
    const len = path.length;
    for (let i = 0; i < len; i++) {
        const el = path[i];
        if (i === 0 && el.length === 0)
            comps.push({ kind: ComponentKind.RootDir });
        else if (el.length === 0)
            continue;
        else if (el === '.')
            comps.push({ kind: ComponentKind.CurDir });
        else if (el === '..')
            comps.push({ kind: ComponentKind.ParentDir });
        else
            comps.push({ kind: ComponentKind.Normal, text: el });
    }
    return comps;
};
exports.pathToComponentsHelper = pathToComponentsHelper;
const pathToComponents = (path) => {
    return (0, exports.pathToComponentsHelper)(Array.isArray(path) ?
        path.map(el => el.trim()) :
        path.trim().split('/').map(el => el.trim()));
};
exports.pathToComponents = pathToComponents;
class Path {
    static exists(path, root) {
        let base = root || directory_1.Directory.root;
        const comps = (0, exports.pathToComponents)(path);
        for (const el of comps) {
            if (el.kind === ComponentKind.RootDir)
                base = directory_1.Directory.root;
            else if (el.kind === ComponentKind.CurDir)
                continue;
            else if (el.kind === ComponentKind.ParentDir) {
                if (base.parent !== null)
                    base = base.parent;
            }
            else if (el.kind === ComponentKind.Normal) {
                if (!el.text)
                    return false;
                if (base.getChild(el.text) === null)
                    return false;
            }
            else {
                throw new Error(`unknown component found! [${el.kind} : ${el.text || ''}]`);
            }
        }
        return true;
    }
    static getPath(fs) {
        const arr = [];
        let root = fs;
        while (root !== null) {
            arr.push(root.name);
            root = root.parent;
        }
        return arr.reverse().join('/');
    }
    static samePath(leftFS, rightFS, strict = false) {
        if (leftFS === null || rightFS === null)
            return false;
        if (typeof leftFS === 'string' && typeof rightFS === 'string') {
            return this.samePathSS(leftFS, rightFS);
        }
        else if (typeof leftFS === 'string' && typeof rightFS !== 'string') {
            return this.samePathSF(leftFS, rightFS);
        }
        else if (typeof leftFS !== 'string' && typeof rightFS === 'string') {
            return this.samePathFS(leftFS, rightFS);
        }
        else {
            return this.samePathFF(leftFS, rightFS, strict);
        }
    }
    static samePathFF(leftFS, rightFS, strict) {
        return leftFS.isEqual(rightFS, strict);
    }
    static samePathSS(leftFS, rightFS) {
        return leftFS === rightFS;
    }
    static samePathSF(leftFS, rightFS) {
        return this.samePathSS(leftFS, this.getPath(rightFS));
    }
    static samePathFS(leftFS, rightFS) {
        return this.samePathSS(this.getPath(leftFS), rightFS);
    }
}
exports.Path = Path;
//# sourceMappingURL=path.js.map