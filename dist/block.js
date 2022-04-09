"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Block = void 0;
const edgeStore_1 = require("./edgeStore");
class Block {
    constructor(keys, next, height) {
        this.keys = keys;
        this._buffer = [];
        this.next = null;
        this.height = 0;
        this.isCommited = false;
        this.next = next;
        this.height = height;
    }
    get size() { return this._buffer.length; }
    static compareKeys(leftKeysArray, rightKeys) {
        return leftKeysArray.every(k => (k in rightKeys));
    }
    static assertEqualKeys(leftKeysArray, rightKeys) {
        if (!this.compareKeys(leftKeysArray, rightKeys))
            throw new Error(`input keys does not overlap with buffer keys, please check`);
    }
    forEach(callback) {
        this._buffer.forEach(callback);
    }
    try_push(data) {
        if (this.isFull)
            return false;
        Block.assertEqualKeys(this.keys, data);
        this._buffer.push(data);
        return true;
    }
    try_pop() {
        const el = this._buffer.pop();
        return el ? el : null;
    }
    delete(start, end) {
        this._buffer = this._buffer.splice(start, end);
    }
    get isFull() { return this.size === edgeStore_1.MAX_BLOCK_SIZE; }
    get isEmpty() { return this.size === 0; }
    get buffer() { return this._buffer; }
    removeAll() {
        this._buffer = [{}];
        this.isCommited = false;
    }
    static deserialize(data, isCommited = true) {
        const first = data.data[0];
        const block = new Block(Object.keys(first), data.next, data.height);
        block._buffer = data.data;
        block.isCommited = isCommited;
        return block;
    }
    serialize() {
        return {
            data: this.buffer,
            size: this.size,
            next: this.next,
            height: this.height,
        };
    }
}
exports.Block = Block;
//# sourceMappingURL=block.js.map