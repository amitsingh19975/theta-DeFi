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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Store = void 0;
const block_1 = require("./block");
const edgeStore_1 = require("./edgeStore");
const ID = 1;
class Store {
    static setPlugin(storagePlugin) {
        this.storagePlugin = storagePlugin;
    }
    static init(config) {
        return __awaiter(this, void 0, void 0, function* () {
            (0, edgeStore_1.initializeEdgeStore)(config);
            yield this._checkConnection();
        });
    }
    static _checkConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            const status = yield this.checkStatus();
            if (status) {
                throw status;
            }
        });
    }
    static parseError(res) {
        return new Error(`[Requrest] failed with error code: ${res.error.code} => "${res.error.message}"`);
    }
    static checkError(res) {
        return 'error' in res;
    }
    static getResult(res) {
        if (this.checkError(res))
            throw this.parseError(res);
        return res;
    }
    static checkStatus() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const res = yield (0, edgeStore_1.getStatus)(0);
                this.getResult(res.data);
                return null;
            }
            catch (_) {
                return new Error('Unable to connect to the Edge Store!, please check domain or port');
            }
        });
    }
    static push(block, payload) {
        if (block.isFull || block.isCommited)
            return false;
        block.try_push(payload);
        return true;
    }
    static pushAndIfFullCommit(block, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            let nBlock = block;
            if (block.isFull) {
                const temp = yield this.commit(block);
                nBlock = temp ? temp : block;
            }
            nBlock.try_push(payload);
            return nBlock;
        });
    }
    static commitHelper(block, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            if (block.isCommited || block.isEmpty)
                return null;
            try {
                const res = yield (0, edgeStore_1.putData)(ID, block);
                const data = Store.getResult(res.data);
                if (!data.result.success)
                    return null;
                return callback(data);
            }
            catch (_) {
                throw new Error('Unable to connect to the Edge Store!, please check domain or port');
            }
        });
    }
    static commit(block) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.commitHelper(block, (res) => {
                var _a;
                this.lastBlockAddress = res.result.key;
                (_a = this.storagePlugin) === null || _a === void 0 ? void 0 : _a.commit(res.result.key, block);
                return new block_1.Block(block.keys, this.lastBlockAddress, block.height + 1);
            });
            return res ? res : null;
        });
    }
    static loadHelper(address, validator) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!address)
                return null;
            const res = yield (0, edgeStore_1.getData)(ID, { key: address });
            const data = Store.getResult(res.data);
            const val = JSON.parse(data.result.val);
            if (validator(val)) {
                throw new Error('Data is corrupted!');
            }
            return val;
        });
    }
    static load(address) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.loadHelper(address, edgeStore_1.validateRow);
            if (!result)
                return null;
            return block_1.Block.deserialize(result);
        });
    }
}
exports.Store = Store;
Store.lastBlockAddress = null;
//# sourceMappingURL=store.js.map