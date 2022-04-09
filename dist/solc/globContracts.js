"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.globSolFiles = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const globSolFilesHelper = (path, relPath = '') => {
    const files = fs_1.default.readdirSync(path, { withFileTypes: true });
    let res = [];
    files.forEach(el => {
        const currPath = path_1.default.join(path, el.name);
        const currRelPath = path_1.default.join(relPath, el.name);
        if (el.isDirectory())
            res = [...res, ...globSolFilesHelper(currPath, currRelPath)];
        else
            res.push({
                path: currRelPath,
                content: fs_1.default.readFileSync(currPath).toString()
            });
    });
    return res;
};
const globSolFiles = (path) => {
    return globSolFilesHelper(path);
};
exports.globSolFiles = globSolFiles;
//# sourceMappingURL=globContracts.js.map