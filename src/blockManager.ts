import { Block, BlockAddress, BlockType } from "./block";
import { MAX_BLOCK_SIZE } from "./edgeStore";
import RangeCache from "./cache";
import { Store } from "./store";

//| 0| 1| 2|...| 1024| <- |1025|....| 2048|

const roughSizeOfObject = ( object: BlockType ) => {

    const objectList = [] as unknown[];
    const stack = [ object ] as unknown[];
    let bytes = 0;

    while ( stack.length ) {
        const value = stack.pop();

        if ( typeof value === 'boolean' ) {
            bytes += 4;
        }
        else if ( typeof value === 'string' ) {
            bytes += (value as string).length * 2;
        }
        else if ( typeof value === 'number' ) {
            bytes += 8;
        }
        else if
        (
            typeof value === 'object'
            && objectList.indexOf( value ) === -1
        )
        {
            objectList.push( value );

            for( const i in value ) {
                stack.push( value[i] );
            }
        }
    }
    return bytes;
}

export class BlockManager {
    private _block: Block;
    private _cachedBlocks = new RangeCache();
    private _start = 0;
    private _dirtySize = 0;
    private lastLoadedAddress: BlockAddress = null;
    private _committedBlocks: Block[] = [];

    private constructor(private readonly contractAddress: BlockAddress, private readonly keys: string[], private _initialAddress: BlockAddress, private numberOfCachedBlocks = MAX_BLOCK_SIZE * 10){
        this.lastLoadedAddress = this.initialAddress;
        this._block = new Block(keys, null, 0);
        if(!this.canCommit){
            this.pushRow = async () => false;
            this.commit = async () => false;
        }
    }

    static async make(contractAddress: BlockAddress, keys: string[], initialAddress: BlockAddress, numberOfCachedBlocks = MAX_BLOCK_SIZE * 10) : Promise<BlockManager> {
        const temp = new BlockManager(contractAddress, keys, initialAddress, numberOfCachedBlocks);

        await temp.loadChunkFromAddress(temp.initialAddress, 0, temp.numberOfCachedBlocks);

        const initBlock = temp.findInCachedBlock(temp.initialAddress);
        if(initBlock){
            if(initBlock.size !== MAX_BLOCK_SIZE){
                initBlock.isCommited = false;
                temp._block = initBlock;
                temp._cachedBlocks.delete(temp.initialAddress);
            }else{
                const next = temp.initialAddress;
                const height = initBlock.height + 1;
                temp._block = new Block(temp.keys, next, height);
            }
        }

        return temp;
    }

    get canCommit() : boolean { return true; }

    get initialAddress() : BlockAddress { return this._initialAddress; }

    get dirtySize() : number { return this._dirtySize; }
    get height() : number { return this._block.height; }

    private inCacheBlock(indexOrAddress: BlockAddress|number) : boolean {
        return this._cachedBlocks.inRange(indexOrAddress);
    }
    
    private findInCachedBlock(indexOrAddress: BlockAddress|number) : Block | null {
        return this._cachedBlocks.get(indexOrAddress);
    }

    private clearCache() : void {
        this._cachedBlocks.clear();
    }

    private async skipBlocks(address: BlockAddress, blocksToSkip: number) : Promise<BlockAddress> {
        let i = 0;

        while(address && i < blocksToSkip){
            const block: Block| null = await this.loadBlock(address);
            if(!block) break;
            address = block.next;
            ++i;
        }

        return address;
    }

    async loadChunkFromInitialAddress(start: number, size: number) : Promise<boolean> {
        let address = this.initialAddress;

        if(!address) return false;

        address = await this.skipBlocks(address, start);

        return await this.loadChunkFromAddress(address, start, size);
    }

    async loadChunkFromAddress(address: BlockAddress, start: number, size: number) : Promise<boolean> {
        if(!address) return false;

        this._cachedBlocks.setRange(start, start + size);
        this._committedBlocks = [];
        let prevAddr = address;
        while(address){
            const block: Block| null = await this.loadBlock(address);
            if(!block) break;
            this._cachedBlocks.add(start, block, address);
            prevAddr = address;
            address = block.next;
            ++start;
        }
        this.lastLoadedAddress = prevAddr;
        return true;
    }

    async loadNextChunk() : Promise<boolean> {
        this._start += this.numberOfCachedBlocks;
        const res = await this.loadChunkFromAddress(this.lastLoadedAddress, this._start, this.numberOfCachedBlocks);
        return res;
    }
    
    async loadPrevChunk() : Promise<boolean> {
        if(this._start === 0) return false;
        else if(this._start - this.numberOfCachedBlocks < 0) return false;
        this._start -= this.numberOfCachedBlocks;
        const res = await this.loadChunkFromInitialAddress(this._start, this.numberOfCachedBlocks);
        return res;
    }


    getBlocks() : Block[] {
        const res = [] as Block[];
        if(!this._block.isEmpty)
            res.push(this._block);
        
        this._committedBlocks.forEach(el => res.push(el));
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this._cachedBlocks.forEach(([block,_]) => res.push(block));
        return res;
    }


    private async loadBlock(address: BlockAddress) : Promise<Block|null> {
        const block = this.findInCachedBlock(address);
        return block ? block : await Store.load(address);
    }

    pushRow = async (row: BlockType, commitIfFull = false, callbackOnCommit: (size: number) => void = (size) => size ) => {
        this._dirtySize += roughSizeOfObject(row);
        
        if(!commitIfFull){
            return Store.push(this._block, row);
        }else{
            if(!Store.push(this._block, row)){
                await this.commit(callbackOnCommit);
                Store.push(this._block, row);
            }
            
            return true;
        }
    }

    commit = async (callbackOnCommit: (size: number) => void = (size) => size) => {
        const block = await Store.commit( this._block);
        if(!block) return false;
        callbackOnCommit(this._dirtySize);
        this._dirtySize = 0;
        
        const address = Store.lastBlockAddress;
        if(address) this._initialAddress = address;
        this._committedBlocks.push(this._block);
        
        this._block = block;
        return true;
    }
}