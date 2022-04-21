import { Block, BlockAddress, BlockType } from "./block";
import { MAX_BLOCK_SIZE } from "./edgeStore";
import RangeCache from "./cache";
import { Store } from "./store";
import sizeof from 'object-sizeof';

//| 0| 1| 2|...| 1024| <- |1025|....| 2048|

export class BlockManager {
    private _block: Block;
    private _cachedBlocks = new RangeCache();
    private _start = 0;
    private lastLoadedAddress: BlockAddress = null;
    private _committedBlocks: Block[] = [];
    private _tempSize = 0;
    private _shouldShowUpdatingBlock = true;

    private constructor(private readonly contractAddress: BlockAddress, private readonly keys: string[], private _initialAddress: BlockAddress, private numberOfCachedBlocks: number){
        this.lastLoadedAddress = this.initialAddress;
        this._block = new Block(keys, null, 0);
        if(!this.canCommit){
            this.pushRow = async () => false;
            this.commit = async () => false;
        }
    }

    static async make(contractAddress: BlockAddress, keys: string[], initialAddress: BlockAddress, numberOfCachedBlocks = 3) : Promise<BlockManager> {
        const temp = new BlockManager(contractAddress, keys, initialAddress, numberOfCachedBlocks);
        await temp.loadChunkFromAddress(temp.initialAddress, 0, temp.numberOfCachedBlocks);
        return temp;
    }

    get canCommit() : boolean { return true; }

    get initialAddress() : BlockAddress { return this._initialAddress; }

    get height() : number { return this._block.height; }

    get currentBlockSize() : number { return this._block.buffer.length }

    get tempSize() : number { return this._tempSize; }

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
        while(address && blocksToSkip--){
            const block: Block| null = await this.loadBlock(address);
            if(!block) break;
            address = block.next;
        }

        return address;
    }

    async loadChunkFromInitialAddress(start: number, size: number) : Promise<boolean> {
        let address = this.initialAddress;

        if(!address) return false;

        address = await this.skipBlocks(address, start);

        const end = start + size;

        return await this._loadChunkFromAddressHelper(address, start, end);
    }

    private async _loadChunkFromAddressHelper(address: BlockAddress, oStart: number, oEnd: number) : Promise<boolean> {
        if(!address) return false;

        if (oStart > 0) {
            this._shouldShowUpdatingBlock = false;
        }else {
            this._shouldShowUpdatingBlock = true;
            if (this._block.isEmpty) {
                oStart += 1;
                const block = await this.loadBlock(address);
                if ( block ) {
                    if (block.size !== MAX_BLOCK_SIZE) {
                        address = block.next;
                        this._block = block;
                        this._block.isCommited = false;
                    } else {
                        oStart -= 1;
                    }
                }
            } else {
                oEnd -=1;
            }
        }

        console.log(oStart, oEnd);

        this._committedBlocks = [];
        this._cachedBlocks.setRange(oStart, oEnd);

        let prevAddr = address;
        while(address && oStart < oEnd){
            const block: Block| null = await this.loadBlock(address);
            if(!block) break;
            this._cachedBlocks.add(oStart, block, address);
            prevAddr = address;
            address = block.next;
            ++oStart;
        }
        this.lastLoadedAddress = prevAddr;
        return true;
    }

    async loadChunkFromAddress(address: BlockAddress, start: number, size: number) : Promise<boolean> {
        return this._loadChunkFromAddressHelper(address, start, start + size);
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
        if(!this._block.isEmpty && this._shouldShowUpdatingBlock) {
            res.push(this._block);
        }
        
        this._committedBlocks.forEach(el => res.push(el));
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this._cachedBlocks.forEach(([block,_]) => res.push(block));
        return res;
    }

    private _flattenBlock(res: Record<string, unknown>[], block: Block): void {
        block.buffer.forEach((el) => res.push(el));
    }

    getData() : Record<string, unknown>[] {
        const res = [] as Record<string, unknown>[];
        if(!this._block.isEmpty && this._shouldShowUpdatingBlock){
            this._flattenBlock(res, this._block);
        }
        
        this._committedBlocks.forEach(el => this._flattenBlock(res, el));
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this._cachedBlocks.forEach(([block,_]) => this._flattenBlock(res, block));
        return res;
    }


    private async loadBlock(address: BlockAddress) : Promise<Block|null> {
        const block = this.findInCachedBlock(address);
        return block ? block : await Store.load(address);
    }

    pushRow = async (row: BlockType, commitIfFull = false, callbackOnCommit?: () => void ) => {
        if(Store.push(this._block, row)) {
            this._tempSize += sizeof(row);
            return true;
        }else if(commitIfFull) {
            await this.commit(callbackOnCommit);
            Store.push(this._block, row);
            this._tempSize += sizeof(row);
            return true;
        }
        return false;
    }

    commit = async (callbackOnCommit?: () => void) => {
        const block = await Store.commit( this._block);
        if(!block) return false;
        if(callbackOnCommit) callbackOnCommit();
        this._tempSize = 0;
        
        const address = Store.lastBlockAddress;
        if(address) this._initialAddress = address;
        this._committedBlocks.push(this._block);
        
        this._block = block;
        return true;
    }
}