import { Block, BlockAddress } from "./block";

export default class RangeCache {
    private _data: Map<number,[Block, BlockAddress]>;
    private _address: Map<BlockAddress,number>;
    private _start = 0;
    private _end = 0;
    
    constructor() {
        this._data = new Map();
        this._address = new Map();
    }

    get size() : number { return this._data.size; }
    get data() : Map<number,[Block, BlockAddress]> { return this._data; }

    private deleteRange(start: number, end: number) : void {
        for(; start < end; ++start){
            const el = this._data.get(start);
            if(el) this._address.delete(el[1]);
            this._data.delete(start);
        }
    }

    private doesOverlap(start: number, end: number) : boolean {
        return !(this._start > end && this._end < start);
    }

    setRange(start: number, end: number) : void {
        if(this.doesOverlap(start, end)){
            this.deleteRange(this._start, start);
            this.deleteRange(end, this._end);
            this._start = start;
            this._end = end;
        }else{
            this.clear();
        }
    }

    forEach(callbackfn: (value: [Block, BlockAddress], key: number, map: Map<number, [Block, BlockAddress]>) => void) {
        this._data.forEach(callbackfn);
    }

    clear() : void {
        this._address.clear();
        this._data.clear();
    }

    inRange(indexOrAddress: number|BlockAddress) : boolean {
        if(typeof indexOrAddress === 'number')
            return this._data.has(indexOrAddress);
        else if(indexOrAddress === null)
            return false;
        else{
            const idx = this._address.get(indexOrAddress);
            if(idx) return this._data.has(idx);
            return false;
        }
    }
    
    get(indexOrAddress: number|BlockAddress) : Block | null {
        if(typeof indexOrAddress === 'number'){
            const el = this._data.get(indexOrAddress);
            return el ? el[0] : null;
        }else if(indexOrAddress === null)
            return null;
        else{
            const idx = this._address.get(indexOrAddress);
            if(typeof idx === 'number') {
                const el = this._data.get(idx);
                return el ? el[0] : null;
            }
            return null;
        }
    }

    delete(indexOrAddress: number|BlockAddress) : void {
        const tempFn = (idx: number) => {
            if(idx === this._start) ++this._start;
            else if(idx === this._end) --this._end;
        };

        if(typeof indexOrAddress === 'number'){
            tempFn(indexOrAddress);
            const el = this._data.get(indexOrAddress);
            if(el) this._address.delete(el[1]);
            this._data.delete(indexOrAddress);
        }else{
            const idx = this._address.get(indexOrAddress);
            if(typeof idx === 'number') {
                tempFn(idx);
                this._data.delete(idx);
            }
            this._address.delete(indexOrAddress);
        }
    }

    add(index: number, block: Block, address: BlockAddress) : boolean {
        if(this._data.has(index) || this._address.has(address) || address === null)
            return false;
        this._data.set(index, [block, address]);
        this._address.set(address, index);
        return true;
    }

    pushBack(block: Block, address: BlockAddress) : boolean {
        const index = this._end;
        const res = this.add(index, block, address);
        if( res ) ++this._end;
        return res;
    }

}