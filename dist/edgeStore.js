"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.market = exports.MarketMethod = exports.getFile = exports.putFile = exports.getData = exports.putData = exports.getPeers = exports.getStatus = exports.getVersion = exports.validateAddress = exports.validateRow = exports.makeURLFromArgs = exports.initializeEdgeStore = exports.EdgeStoreConfig = exports.MAX_BLOCK_SIZE = void 0;
const axios_1 = __importDefault(require("axios"));
const block_1 = require("./block");
const config_json_1 = __importDefault(require("./config.json"));
exports.MAX_BLOCK_SIZE = 1024;
exports.EdgeStoreConfig = {
    protocol: ('protocol' in config_json_1.default ? config_json_1.default.protocol : 'https://'),
    domain: ('domain' in config_json_1.default ? config_json_1.default.domain : 'localhost'),
    port: ('port' in config_json_1.default ? config_json_1.default.port : null),
    market: {
        domain: ('market' in config_json_1.default && 'domain' in config_json_1.default.market ? config_json_1.default.market.domain : 'localhost'),
        port: ('market' in config_json_1.default && 'port' in config_json_1.default.market ? config_json_1.default.market.port : 8080)
    }
};
const initializeEdgeStore = (config) => {
    var _a, _b;
    exports.EdgeStoreConfig.domain = (config === null || config === void 0 ? void 0 : config.domain) || exports.EdgeStoreConfig.domain;
    exports.EdgeStoreConfig.port = (config === null || config === void 0 ? void 0 : config.port) || exports.EdgeStoreConfig.port;
    exports.EdgeStoreConfig.protocol = (config === null || config === void 0 ? void 0 : config.protocol) || exports.EdgeStoreConfig.protocol;
    exports.EdgeStoreConfig.market = {
        domain: ((_a = config === null || config === void 0 ? void 0 : config.market) === null || _a === void 0 ? void 0 : _a.domain) || exports.EdgeStoreConfig.market.domain,
        port: ((_b = config === null || config === void 0 ? void 0 : config.market) === null || _b === void 0 ? void 0 : _b.port) || exports.EdgeStoreConfig.market.port
    };
    return exports.EdgeStoreConfig;
};
exports.initializeEdgeStore = initializeEdgeStore;
const makeURLFromArgs = ({ protocol, domain, port, suffix }) => {
    return protocol + domain + (port ? ':' + port : '') + (suffix || '');
};
exports.makeURLFromArgs = makeURLFromArgs;
const edgeStoreURL = () => {
    return (0, exports.makeURLFromArgs)({
        suffix: '/rpc',
        protocol: exports.EdgeStoreConfig.protocol,
        domain: exports.EdgeStoreConfig.domain,
        port: exports.EdgeStoreConfig.port || undefined
    });
};
const storeURL = () => {
    return (0, exports.makeURLFromArgs)({
        protocol: exports.EdgeStoreConfig.protocol,
        domain: exports.EdgeStoreConfig.market.domain,
        port: exports.EdgeStoreConfig.market.port || undefined
    });
};
var EdgeStoreMethod;
(function (EdgeStoreMethod) {
    EdgeStoreMethod["GetVersion"] = "edgestore.GetVersion";
    EdgeStoreMethod["GetStatus"] = "edgestore.GetStatus";
    EdgeStoreMethod["GetPeers"] = "edgestore.GetPeers";
    EdgeStoreMethod["PutData"] = "edgestore.PutData";
    EdgeStoreMethod["GetData"] = "edgestore.GetData";
    EdgeStoreMethod["PutFile"] = "edgestore.PutFile";
    EdgeStoreMethod["GetFile"] = "edgestore.GetFile";
})(EdgeStoreMethod || (EdgeStoreMethod = {}));
const validateRow = (row) => {
    return ('data' in row) && ('next' in row) && ('size' in row) && ('id' in row);
};
exports.validateRow = validateRow;
const validateAddress = (row) => {
    return ('addresses' in row) && ('next' in row) && ('id' in row);
};
exports.validateAddress = validateAddress;
const prepareDataBlock = (val) => {
    if (Object.keys(val).length === 0)
        return [];
    else
        return [{ val: JSON.stringify(val) }];
};
const prepareDataHelper = (params) => {
    if (Object.keys(params).length === 0)
        return [];
    else
        return [params];
};
const prepareData = (method, id, payload) => {
    const params = (payload instanceof block_1.Block) ? prepareDataBlock(payload.serialize()) : prepareDataHelper(payload);
    return {
        jsonrpc: ('jsonrpc' in config_json_1.default ? config_json_1.default['jsonrpc'] : '2.0'),
        method,
        id,
        params
    };
};
const postToEdgeStore = (method, id, params) => __awaiter(void 0, void 0, void 0, function* () {
    const URL = edgeStoreURL();
    const payload = prepareData(method, id, params || {});
    return axios_1.default.post(URL, payload);
});
const getVersion = (id, params) => __awaiter(void 0, void 0, void 0, function* () { return postToEdgeStore(EdgeStoreMethod.GetVersion, id, params); });
exports.getVersion = getVersion;
const getStatus = (id, params) => __awaiter(void 0, void 0, void 0, function* () { return postToEdgeStore(EdgeStoreMethod.GetStatus, id, params); });
exports.getStatus = getStatus;
const getPeers = (id, params) => __awaiter(void 0, void 0, void 0, function* () { return postToEdgeStore(EdgeStoreMethod.GetPeers, id, params); });
exports.getPeers = getPeers;
const putData = (id, params) => __awaiter(void 0, void 0, void 0, function* () { return postToEdgeStore(EdgeStoreMethod.PutData, id, params); });
exports.putData = putData;
const getData = (id, params) => __awaiter(void 0, void 0, void 0, function* () { return postToEdgeStore(EdgeStoreMethod.GetData, id, params); });
exports.getData = getData;
const putFile = (id, params) => __awaiter(void 0, void 0, void 0, function* () { return postToEdgeStore(EdgeStoreMethod.PutFile, id, params); });
exports.putFile = putFile;
const getFile = (id, params) => __awaiter(void 0, void 0, void 0, function* () { return postToEdgeStore(EdgeStoreMethod.GetFile, id, params); });
exports.getFile = getFile;
var MarketMethod;
(function (MarketMethod) {
    MarketMethod["AddTable"] = "Market.AddTable";
    MarketMethod["AddImage"] = "Market.AddImage";
})(MarketMethod = exports.MarketMethod || (exports.MarketMethod = {}));
const market = (method, payload) => __awaiter(void 0, void 0, void 0, function* () {
    return yield axios_1.default.post(storeURL(), payload);
});
exports.market = market;
//# sourceMappingURL=edgeStore.js.map