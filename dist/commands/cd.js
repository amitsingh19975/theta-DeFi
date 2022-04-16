"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cdWithBothFileAndDirAsLastChild = exports.cd = void 0;
const fs_1 = require("../fs");
const path_1 = require("../path");
const cd = (path, root) => {
    let base = root || fs_1.Directory.root;
    const comps = (0, path_1.pathToComponents)(path);
    for (const el of comps) {
        if (el.kind === path_1.ComponentKind.RootDir)
            base = fs_1.Directory.root;
        else if (el.kind === path_1.ComponentKind.CurDir)
            continue;
        else if (el.kind === path_1.ComponentKind.ParentDir) {
            if (base.parent !== null)
                base = base.parent;
        }
        else if (el.kind === path_1.ComponentKind.Normal) {
            if (!el.text)
                throw new Error('Internal Parsing error!');
            const child = base.getChild(el.text);
            if (!child)
                throw new Error(`Directory['${base.realName}'] does not have child named '${el.text}'`);
            if (child.isFile())
                throw new Error(`Cannot 'cd' into file['${el.text}']; it only works on directory`);
            const dir = child.asDir();
            if (dir)
                base = dir;
            else
                throw Error('[Internal Error] unknown \'FileSystem\' type');
        }
        else {
            throw new Error(`unknown component found! [${el.kind} : ${el.text || ''}]`);
        }
    }
    return base;
};
exports.cd = cd;
const cdWithBothFileAndDirAsLastChild = (path, root) => {
    let base = root || fs_1.Directory.root;
    const comps = (0, path_1.pathToComponents)(path);
    const len = comps.length;
    for (let i = 0; i < len; i += 1) {
        const el = comps[i];
        if (el.kind === path_1.ComponentKind.RootDir)
            base = fs_1.Directory.root;
        else if (el.kind === path_1.ComponentKind.CurDir)
            continue;
        else if (el.kind === path_1.ComponentKind.ParentDir) {
            if (base.parent !== null)
                base = base.parent;
        }
        else if (el.kind === path_1.ComponentKind.Normal) {
            if (!el.text)
                throw new Error('Internal Parsing error!');
            const child = base.getChild(el.text);
            if (!child)
                throw new Error(`Directory['${base.realName}'] does not have child named '${el.text}'`);
            if (child.isFile()) {
                if (i < len - 1)
                    throw new Error(`Cannot 'cd' into file['${el.text}']; it only works on directory`);
                else
                    return child;
            }
            const dir = child.asDir();
            if (dir)
                base = dir;
            else
                throw Error('[Internal Error] unknown \'FileSystem\' type');
        }
        else {
            throw new Error(`unknown component found! [${el.kind} : ${el.text || ''}]`);
        }
    }
    return base;
};
exports.cdWithBothFileAndDirAsLastChild = cdWithBothFileAndDirAsLastChild;
//# sourceMappingURL=cd.js.map