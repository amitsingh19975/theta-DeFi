"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ls = void 0;
const fs_1 = require("../fs");
const cd_1 = require("./cd");
const addFInfo = (file) => {
    var _a;
    return {
        name: file.name,
        parent: (_a = file.parent) === null || _a === void 0 ? void 0 : _a.name,
        size: file.size,
        isFile: true,
        fullPath: fs_1.Path.getPath(file),
    };
};
const addDInfo = (dir) => {
    var _a;
    return {
        name: dir.name,
        parent: (_a = dir.parent) === null || _a === void 0 ? void 0 : _a.name,
        size: dir.size,
        isFile: false,
        fullPath: fs_1.Path.getPath(dir),
    };
};
const getNodeInfo = (node) => {
    const infos = [];
    const dir = node.asDir();
    const file = node.asFile();
    if (file) {
        infos.push(addFInfo(file));
    }
    else if (dir) {
        for (const c of dir.children) {
            const cf = c.asFile();
            const cd = c.asDir();
            if (cf)
                infos.push(addFInfo(cf));
            else if (cd)
                infos.push(addDInfo(cd));
        }
    }
    return infos;
};
const ls = (currNode, path) => {
    const dir = (0, cd_1.cd)(path, currNode);
    if (!dir)
        return [];
    return getNodeInfo(dir);
};
exports.ls = ls;
//# sourceMappingURL=ls.js.map