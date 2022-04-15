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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildInputType = exports.buildArgsFromFields = void 0;
const fileSystem_1 = require("./fileSystem");
const tableInfo_1 = require("./tableInfo");
const edgeStore_1 = require("../edgeStore");
const blockManager_1 = require("../blockManager");
const graphql_1 = require("graphql");
const fs_1 = require("../fs");
const file_1 = __importStar(require("./file"));
const mapBlocks = (blocks) => {
    const res = [];
    blocks.map(block => block.forEach(el => res.push(el)));
    return res;
};
const buildArgsFromFields = (fileInfo, sep = ', ') => {
    const args = [];
    fileInfo.forEach(el => args.push(el.name + ': ' + el.type.toStr()));
    return args.join(sep);
};
exports.buildArgsFromFields = buildArgsFromFields;
const buildInputType = (fileInfo) => {
    const typeName = fileInfo.tableName + 'Input';
    return [typeName, `
input ${typeName} { 
\t${(0, exports.buildArgsFromFields)(fileInfo, '\n\t')}
}
    `];
};
exports.buildInputType = buildInputType;
class TableFile extends file_1.default {
    constructor(parent, name, fileInfo, blockAddress, bufferSize, contractAddress) {
        var _a;
        super(parent, name, blockAddress, bufferSize, file_1.FileKind.Table, contractAddress);
        this._height = 0;
        this._tableInfo = fileInfo;
        this._height = ((_a = this._manager) === null || _a === void 0 ? void 0 : _a.height) || 0;
    }
    static make(parent, name, fileInfoOrGraphqlSourceCode, blockAddress, bufferSize, contractAddress) {
        if (fileInfoOrGraphqlSourceCode instanceof tableInfo_1.TableInfo) {
            return new TableFile(parent, name, fileInfoOrGraphqlSourceCode, blockAddress || null, bufferSize || 0, contractAddress || null);
        }
        else {
            return new TableFile(parent, name, tableInfo_1.TableInfo.fromGraphQLSource(fileInfoOrGraphqlSourceCode), blockAddress || null, bufferSize || 0, contractAddress || null);
        }
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this._manager = yield blockManager_1.BlockManager.make(this.contractAddress, this.keys, this.blockAddress);
        });
    }
    setCallback(callback) { this._callback = callback; }
    get approxSize() { var _a; return this._size + (((_a = this._manager) === null || _a === void 0 ? void 0 : _a.tempSize) || 0); }
    get tableInfo() { return this._tableInfo; }
    get tableName() { return this._tableInfo.tableName; }
    get keys() { return this._tableInfo.keys; }
    get height() { return this._height; }
    get currentBlocks() { var _a; return ((_a = this._manager) === null || _a === void 0 ? void 0 : _a.getBlocks()) || []; }
    get rows() { var _a; return ((_a = this._manager) === null || _a === void 0 ? void 0 : _a.getData()) || []; }
    _pushRow(manager, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const arr = this._tableInfo.buildRow(args);
            const res = yield manager.pushRow(arr, true, () => { var _a; return this._size += ((_a = this._manager) === null || _a === void 0 ? void 0 : _a.tempSize) || 0; });
            if (!res) {
                throw new Error(`["addRow"] => unable to add row into the database('${this.tableName}')`);
            }
            this._initialBlockAddress = manager.initialAddress ? manager.initialAddress : this._initialBlockAddress;
            this._height = manager.height;
        });
    }
    makeGraphQLMutationResolver(resolver) {
        resolver['addRow'] = (args) => __awaiter(this, void 0, void 0, function* () {
            if (!args)
                throw new Error('[resolver] => arguments are undefined!');
            const input = args.input;
            if (typeof input === 'undefined') {
                throw new Error('[addRow] => "input" parameter not found');
            }
            const manager = this._manager;
            if (!manager)
                throw new Error('[Table]: block manager is not initialized');
            yield this._pushRow(manager, input);
            if (this._callback)
                this._callback({ funcName: 'addRow', args: args['input'], type: 'Mutation' });
            return true;
        });
        resolver['addRows'] = (args) => __awaiter(this, void 0, void 0, function* () {
            if (!args)
                throw new Error('[resolver] => arguments are undefined!');
            const inputs = args.input;
            if (typeof inputs === 'undefined') {
                throw new Error('[addRows] => "input" parameter not found');
            }
            if (!Array.isArray(inputs)) {
                throw new Error('[addRows] => "input" parameter must be an array');
            }
            const manager = this._manager;
            if (!manager)
                throw new Error('[Table]: block manager is not initialized');
            inputs.forEach((el) => __awaiter(this, void 0, void 0, function* () { return yield this._pushRow(manager, el); }));
            if (this._callback)
                this._callback({ funcName: 'addRows', args: inputs, type: 'Mutation' });
            return true;
        });
        resolver['commit'] = () => __awaiter(this, void 0, void 0, function* () {
            const manager = this._manager;
            if (!manager)
                throw new Error('[Table]: block manager is not initialized');
            const res = yield manager.commit(() => { var _a; return this._size += ((_a = this._manager) === null || _a === void 0 ? void 0 : _a.tempSize) || 0; });
            if (this._callback)
                this._callback({ funcName: 'commit', type: 'Mutation' });
            this._height = manager.height;
            return res;
        });
    }
    parseTypes(data) {
        const res = {};
        for (const k in data) {
            res[k] = this._tableInfo.parseType(k, data[k]);
        }
        return res;
    }
    getInfo() {
        const manager = this._manager;
        if (manager)
            this._height = manager.height;
        const fields = [];
        this._tableInfo.forEach(field => fields.push({
            name: field.name,
            type: field.type.toString(),
            description: field.description
        }));
        return {
            description: this._tableInfo.description,
            name: this.tableName,
            size: this.size,
            source: this._tableInfo.source,
            height: this.height,
            fields: fields,
            path: fs_1.Path.getPath(this)
        };
    }
    makeGraphQLResolver() {
        const resolver = {};
        resolver['show'] = () => {
            const manager = this._manager;
            if (!manager)
                throw new Error('[Table]: block manager is not initialized');
            if (this._callback)
                this._callback({ funcName: 'show', type: 'Query' });
            return mapBlocks(manager.getBlocks());
        };
        resolver['loadChunk'] = (args) => __awaiter(this, void 0, void 0, function* () {
            if (!args)
                throw new Error('[resolver] => arguments are undefined!');
            let start = 0;
            let end = edgeStore_1.MAX_BLOCK_SIZE;
            if ('start' in args)
                start = args['start'];
            if ('end' in args)
                end = args['end'];
            const manager = this._manager;
            if (!manager)
                throw new Error('[Table]: block manager is not initialized');
            yield manager.loadChunkFromInitialAddress(start, end);
            if (this._callback)
                this._callback({ funcName: 'loadChunk', type: 'Query' });
            return mapBlocks(manager.getBlocks());
        });
        resolver['info'] = () => {
            if (this._callback)
                this._callback({ funcName: 'info', type: 'Query' });
            return this.getInfo();
        };
        this.makeGraphQLMutationResolver(resolver);
        return resolver;
    }
    makeGraphQLSchema() {
        const input = (0, exports.buildInputType)(this._tableInfo);
        return (0, graphql_1.buildSchema)(`
            ${this._tableInfo.source}

            ${input[1]}

            type Mutation {
                addRow(input: ${input[0]}!) : Boolean!
                addRows(input: [${input[0]}!]!) : Boolean!
                commit : Boolean!
            }

            type Fields {
                name: String!
                type: String!
                description: String!
            }
            
            type Info {
                description: String!
                path: String!
                name: String!
                size: Int!
                source: String!
                height: Int!
                fields: [Fields]
            }

            type Query {
                info : Info
                loadChunk(start: Int, end: Int): [${this.tableName}]
                show : [${this.tableName}]
            }
        `);
    }
    get basename() {
        return this.name.split('.')[0];
    }
    get extension() {
        const arr = this.name.split('.');
        return arr.length === 2 ? (arr.pop() || '') : '';
    }
    static deserialize(file) {
        const info = tableInfo_1.TableInfo.deserialize(file.serializedChild.tableInfo);
        const temp = TableFile.make(null, file.name, info, file.blockAddress, file.size, file.contractAddress);
        return temp;
    }
    serialize() {
        const tableInfo = this._tableInfo.serialize();
        const size = this.size;
        return {
            name: this.name,
            parent: this.parent ? this.parent.name : '',
            type: fileSystem_1.NodeType.File,
            size,
            kind: this.kind,
            blockAddress: this._initialBlockAddress,
            serializedChild: {
                tableInfo
            },
            contractAddress: this._contractAddress,
        };
    }
}
exports.default = TableFile;
//# sourceMappingURL=tableFile.js.map