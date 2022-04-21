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
exports.BlockManager = void 0;
const block_1 = require("./block");
const edgeStore_1 = require("./edgeStore");
const cache_1 = __importDefault(require("./cache"));
const store_1 = require("./store");
const object_sizeof_1 = __importDefault(require("object-sizeof"));
//| 0| 1| 2|...| 1024| <- |1025|....| 2048|
class BlockManager {
    constructor(contractAddress, keys, _initialAddress, numberOfCachedBlocks = edgeStore_1.MAX_BLOCK_SIZE * 10) {
        this.contractAddress = contractAddress;
        this.keys = keys;
        this._initialAddress = _initialAddress;
        this.numberOfCachedBlocks = numberOfCachedBlocks;
        this._cachedBlocks = new cache_1.default();
        this._start = 0;
        this.lastLoadedAddress = null;
        this._committedBlocks = [];
        this._tempSize = 0;
        this.pushRow = (row, commitIfFull = false, callbackOnCommit) => __awaiter(this, void 0, void 0, function* () {
            if (store_1.Store.push(this._block, row)) {
                this._tempSize += (0, object_sizeof_1.default)(row);
                return true;
            }
            else if (commitIfFull) {
                yield this.commit(callbackOnCommit);
                store_1.Store.push(this._block, row);
                this._tempSize += (0, object_sizeof_1.default)(row);
                return true;
            }
            return false;
        });
        this.commit = (callbackOnCommit) => __awaiter(this, void 0, void 0, function* () {
            const block = yield store_1.Store.commit(this._block);
            if (!block)
                return false;
            if (callbackOnCommit)
                callbackOnCommit();
            this._tempSize = 0;
            const address = store_1.Store.lastBlockAddress;
            if (address)
                this._initialAddress = address;
            this._committedBlocks.push(this._block);
            this._block = block;
            return true;
        });
        this.lastLoadedAddress = this.initialAddress;
        this._block = new block_1.Block(keys, null, 0);
        if (!this.canCommit) {
            this.pushRow = () => __awaiter(this, void 0, void 0, function* () { return false; });
            this.commit = () => __awaiter(this, void 0, void 0, function* () { return false; });
        }
    }
    static make(contractAddress, keys, initialAddress, numberOfCachedBlocks = edgeStore_1.MAX_BLOCK_SIZE * 3) {
        return __awaiter(this, void 0, void 0, function* () {
            const temp = new BlockManager(contractAddress, keys, initialAddress, numberOfCachedBlocks);
            yield temp.loadChunkFromAddress(temp.initialAddress, 0, temp.numberOfCachedBlocks);
            const initBlock = temp.findInCachedBlock(temp.initialAddress);
            if (initBlock) {
                if (initBlock.size !== edgeStore_1.MAX_BLOCK_SIZE) {
                    initBlock.isCommited = false;
                    temp._block = initBlock;
                    temp._cachedBlocks.delete(temp.initialAddress);
                }
                else {
                    const next = temp.initialAddress;
                    const height = initBlock.height + 1;
                    temp._block = new block_1.Block(temp.keys, next, height);
                }
            }
            return temp;
        });
    }
    get canCommit() { return true; }
    get initialAddress() { return this._initialAddress; }
    get height() { return this._block.height; }
    get currentBlockSize() { return this._block.buffer.length; }
    get tempSize() { return this._tempSize; }
    inCacheBlock(indexOrAddress) {
        return this._cachedBlocks.inRange(indexOrAddress);
    }
    findInCachedBlock(indexOrAddress) {
        return this._cachedBlocks.get(indexOrAddress);
    }
    clearCache() {
        this._cachedBlocks.clear();
    }
    skipBlocks(address, blocksToSkip) {
        return __awaiter(this, void 0, void 0, function* () {
            while (address && blocksToSkip--) {
                const block = yield this.loadBlock(address);
                if (!block)
                    break;
                address = block.next;
            }
            return address;
        });
    }
    loadChunkFromInitialAddress(start, size) {
        return __awaiter(this, void 0, void 0, function* () {
            let address = this.initialAddress;
            if (!address)
                return false;
            address = yield this.skipBlocks(address, start);
            return yield this.loadChunkFromAddress(address, start, size);
        });
    }
    loadChunkFromAddress(address, start, size) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!address)
                return false;
            this._cachedBlocks.setRange(start, start + size);
            this._committedBlocks = [];
            let prevAddr = address;
            while (address && start < size) {
                const block = yield this.loadBlock(address);
                if (!block)
                    break;
                this._cachedBlocks.add(start, block, address);
                prevAddr = address;
                address = block.next;
                ++start;
            }
            this.lastLoadedAddress = prevAddr;
            return true;
        });
    }
    loadNextChunk() {
        return __awaiter(this, void 0, void 0, function* () {
            this._start += this.numberOfCachedBlocks;
            const res = yield this.loadChunkFromAddress(this.lastLoadedAddress, this._start, this.numberOfCachedBlocks);
            return res;
        });
    }
    loadPrevChunk() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._start === 0)
                return false;
            else if (this._start - this.numberOfCachedBlocks < 0)
                return false;
            this._start -= this.numberOfCachedBlocks;
            const res = yield this.loadChunkFromInitialAddress(this._start, this.numberOfCachedBlocks);
            return res;
        });
    }
    getBlocks() {
        const res = [];
        if (!this._block.isEmpty)
            res.push(this._block);
        this._committedBlocks.forEach(el => res.push(el));
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this._cachedBlocks.forEach(([block, _]) => res.push(block));
        return res;
    }
    _flattenBlock(res, block) {
        block.buffer.forEach((el) => res.push(el));
    }
    getData() {
        const res = [];
        if (!this._block.isEmpty) {
            this._flattenBlock(res, this._block);
        }
        this._committedBlocks.forEach(el => this._flattenBlock(res, el));
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this._cachedBlocks.forEach(([block, _]) => this._flattenBlock(res, block));
        return res;
    }
    loadBlock(address) {
        return __awaiter(this, void 0, void 0, function* () {
            const block = this.findInCachedBlock(address);
            return block ? block : yield store_1.Store.load(address);
        });
    }
}
exports.BlockManager = BlockManager;
//# sourceMappingURL=blockManager.js.map