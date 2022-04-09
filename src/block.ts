import { BlockDataType, MAX_BLOCK_SIZE, RowType } from "./edgeStore";
import { AcceptableType } from "./fsInternal/types";

export type BlockAddress = string | null;

export type BlockType = {[key: string|symbol] : AcceptableType};

export class Block{
    private _buffer = [] as BlockDataType;
    next: BlockAddress = null;
    height = 0;
    isCommited = false;

    constructor(readonly keys: string[], next: BlockAddress, height: number){
        this.next = next;
        this.height = height;
    }

    get size() : number { return this._buffer.length; }

    private static compareKeys(leftKeysArray: string[], rightKeys: BlockType) : boolean {
        return leftKeysArray.every(k => (k in rightKeys));
    }

    private static assertEqualKeys(leftKeysArray: string[], rightKeys: BlockType) : void {
        if(!this.compareKeys(leftKeysArray, rightKeys))
            throw new Error(`input keys does not overlap with buffer keys, please check`);
    }

    forEach(callback: (el: BlockType, i: number, arr: BlockType[]) => void) {
        this._buffer.forEach(callback);
    }

    try_push(data: BlockType) : boolean {
        if(this.isFull)
            return false;
        
        Block.assertEqualKeys(this.keys, data);
        this._buffer.push(data);
        return true;
    }

    try_pop() : BlockType | null {
        const el = this._buffer.pop();
        return el ? el : null;
    }

    delete(start: number, end?: number) : void {
        this._buffer = this._buffer.splice(start, end);
    }

    get isFull() : boolean { return this.size === MAX_BLOCK_SIZE; }
    get isEmpty() : boolean { return this.size === 0; }

    get buffer(): BlockDataType { return this._buffer; }

    removeAll() : void { 
        this._buffer = [{}] as BlockDataType;
        this.isCommited = false;
    }

    static deserialize(data: RowType, isCommited = true) : Block {
        const first = data.data[0];
        const block = new Block(Object.keys(first), data.next, data.height);
        block._buffer = data.data;
        block.isCommited = isCommited;
        return block;
    }

    serialize() : RowType {
        return {
            data: this.buffer,
            size: this.size,
            next: this.next,
            height: this.height,
        }
    }
}