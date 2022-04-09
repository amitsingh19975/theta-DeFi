"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSharedFileSystem = exports.getFile = exports.getDir = exports.getDirOrFile = exports.deserializeFileSystem = exports.deserializeFile = exports.deserializeDir = exports.serializeFileSystem = exports.makeTable = exports.makeDir = exports.Path = exports.NodeType = exports.FileSystem = exports.File = exports.Directory = void 0;
const directory_1 = require("./fsInternal/directory");
Object.defineProperty(exports, "Directory", { enumerable: true, get: function () { return directory_1.Directory; } });
const file_1 = __importStar(require("./fsInternal/file"));
exports.File = file_1.default;
const fileSystem_1 = require("./fsInternal/fileSystem");
Object.defineProperty(exports, "FileSystem", { enumerable: true, get: function () { return fileSystem_1.FileSystem; } });
Object.defineProperty(exports, "NodeType", { enumerable: true, get: function () { return fileSystem_1.NodeType; } });
const path_1 = require("./path");
Object.defineProperty(exports, "Path", { enumerable: true, get: function () { return path_1.Path; } });
const tableFile_1 = __importDefault(require("./fsInternal/tableFile"));
const tableInfo_1 = require("./fsInternal/tableInfo");
const makeDir = (path, root) => {
    let base = root || directory_1.Directory.root;
    const comps = (0, path_1.pathToComponents)(path);
    for (const el of comps) {
        if (el.kind === path_1.ComponentKind.RootDir)
            base = directory_1.Directory.root;
        else if (el.kind === path_1.ComponentKind.CurDir)
            continue;
        else if (el.kind === path_1.ComponentKind.ParentDir) {
            if (base.parent !== null)
                base = base.parent;
        }
        else if (el.kind === path_1.ComponentKind.Normal) {
            if (!el.text)
                return null;
            const child = base.getChild(el.text);
            if (child && child.isDir())
                base = child;
            else
                base = directory_1.Directory.make(base, el.text);
        }
        else {
            throw new Error(`unknown component found! [${el.kind} : ${el.text || ''}]`);
        }
    }
    return base;
};
exports.makeDir = makeDir;
const makeTable = (name, fileInfoOrGraphqlSourceCode, blockAddress, size, root) => {
    name = name.trim();
    if (name.length === 0)
        throw new Error('Filename cannot be empty!');
    const node = root || directory_1.Directory.root;
    if (name.indexOf('/') >= 0)
        throw new Error("Filename cannot have '/'");
    return tableFile_1.default.make(node, name, fileInfoOrGraphqlSourceCode || '', blockAddress, size);
};
exports.makeTable = makeTable;
const serializeFileSystem = (root) => {
    const node = root || directory_1.Directory.root;
    return JSON.stringify(node.serialize());
};
exports.serializeFileSystem = serializeFileSystem;
const deserializeDir = (dir) => {
    const temp = directory_1.Directory.make(null, dir.name);
    dir.children.forEach(el => temp.children.push((0, exports.deserializeFileSystem)(el)));
    temp.setSizeWithoutUpdatingParent(dir.size);
    return temp;
};
exports.deserializeDir = deserializeDir;
const deserializeFile = (file) => {
    let temp;
    if (file.kind === file_1.FileKind.Table) {
        const info = tableInfo_1.TableInfo.deserialize(file.serializedChild.tableInfo);
        temp = tableFile_1.default.make(null, file.name, info, file.blockAddress, file.size);
    }
    else {
        throw new Error('[File]: unkown file kind found!');
    }
    return temp;
};
exports.deserializeFile = deserializeFile;
const deserializeFileSystem = (serializedObject) => {
    const data = (typeof serializedObject === 'string' ? JSON.parse(serializedObject) : serializedObject);
    if (data.type === fileSystem_1.NodeType.Dir) {
        (0, exports.deserializeDir)(data);
    }
    else if (data.type === fileSystem_1.NodeType.File) {
        (0, exports.deserializeFile)(data);
    }
    return directory_1.Directory.root;
};
exports.deserializeFileSystem = deserializeFileSystem;
const getDirOrFile = (path, root) => {
    let base = root || directory_1.Directory.root;
    const comps = (0, path_1.pathToComponents)(path);
    const len = comps.length;
    let i = 0;
    for (; i < len; ++i) {
        const el = comps[i];
        if (el.kind === path_1.ComponentKind.RootDir)
            base = directory_1.Directory.root;
        else if (el.kind === path_1.ComponentKind.CurDir)
            continue;
        else if (el.kind === path_1.ComponentKind.ParentDir) {
            if (base.parent !== null)
                base = base.parent;
        }
        else if (el.kind === path_1.ComponentKind.Normal) {
            if (!el.text)
                return null;
            const dir = base.asDir();
            if (dir) {
                const child = dir.getChild(el.text);
                if (!child)
                    return null;
                base = child;
            }
            else {
                break;
            }
        }
        else {
            throw new Error(`unknown component found! [${el.kind} : ${el.text || ''}]`);
        }
    }
    return i === len ? base : null;
};
exports.getDirOrFile = getDirOrFile;
const getDir = (path, root) => {
    const fs = (0, exports.getDirOrFile)(path, root);
    if (fs) {
        const dir = fs.asDir();
        return dir ? dir : null;
    }
    return null;
};
exports.getDir = getDir;
const getFile = (path, root) => {
    const fs = (0, exports.getDirOrFile)(path, root);
    if (fs) {
        const file = fs.asFile();
        return file ? file : null;
    }
    return null;
};
exports.getFile = getFile;
const getSharedFileSystem = (fs, arr = []) => {
    throw new Error('unimplemented!');
};
exports.getSharedFileSystem = getSharedFileSystem;
//# sourceMappingURL=fs.js.map