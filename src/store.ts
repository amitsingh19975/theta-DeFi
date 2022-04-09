import { Block, BlockAddress, BlockType } from './block';
import { 
    initializeEdgeStore, 
    getStatus, 
    EdgeStoreConfigType, 
    putData, 
    RowType, 
    ErrorType, 
    EdgeResponeType, 
    GetStatusType, 
    PutDataType, 
    getData, 
    StorageType, 
    GetDataType, 
    validateRow, 
    BlockDataType} from './edgeStore';

const ID = 1;


type CommitCallbackType = (result: PutDataType) => Block|null;

type localStoragePlugin = {
    commit: ( (blockAddress: BlockAddress, block: Block) => void ),
    update: ( (oldAddress: BlockAddress, newAddress: BlockAddress) => void )
}

export class Store {
    static lastBlockAddress: BlockAddress = null;

    static storagePlugin?: localStoragePlugin;

    static setPlugin(storagePlugin: localStoragePlugin) {
        this.storagePlugin = storagePlugin;
    }

    static async init(config?: EdgeStoreConfigType) : Promise<void> {
        initializeEdgeStore(config);
        await this._checkConnection();
    }

    private static async _checkConnection() : Promise<void> {
        const status = await this.checkStatus();
        
        if(status){
            throw status;
        }
    }

    private static parseError(res: ErrorType) : Error | null{
        return new Error(`[Requrest] failed with error code: ${res.error.code} => "${res.error.message}"`);
    }

    private static checkError(res: EdgeResponeType) : boolean {
        return 'error' in res;
    }
    
    private static getResult<T>(res: EdgeResponeType) : T {
        if(this.checkError(res))
            throw this.parseError(res as ErrorType);
        return (res as unknown as T) ;
    }
    
    private static async checkStatus() : Promise<Error|null> {
        try{
            const res = await getStatus(0);
            this.getResult<GetStatusType>(res.data);
            return null;
        }catch(_){
            return new Error('Unable to connect to the Edge Store!, please check domain or port');
        }
    }

    static push(block: Block, payload: BlockType) : boolean{
        if(block.isFull || block.isCommited)
            return false;
        block.try_push(payload);
        return true;
    }

    static async pushAndIfFullCommit(block: Block, payload: BlockType) : Promise<Block|null> {
        let nBlock = block;
        if(block.isFull){
            const temp = await this.commit(block);
            nBlock = temp ? temp : block;
        }

        nBlock.try_push(payload);
        return nBlock;
    }

    private static async commitHelper(block: Block, callback: CommitCallbackType) : Promise<Block|null>{
        if(block.isCommited || block.isEmpty)
            return null;
        
        try{
            const res = await putData(ID, block);
            const data = Store.getResult<PutDataType>(res.data);
            if(!data.result.success)
                return null;

            return callback(data);
        }catch(_){
            throw new Error('Unable to connect to the Edge Store!, please check domain or port');
        }
    }

    static async commit(block: Block) : Promise<Block|null> {
        const res = await this.commitHelper(block, (res) => {
            this.lastBlockAddress = res.result.key;
            this.storagePlugin?.commit(res.result.key, block);
            return new Block(block.keys, this.lastBlockAddress, block.height + 1);
        });
        
        return res ? res : null;
    }

    private static async loadHelper<T>(address: BlockAddress, validator: (data: BlockDataType) => boolean) : Promise<T|null> {

        if(!address) 
            return null;

        const res = await getData(ID, {key: address} as StorageType);
        const data = Store.getResult<GetDataType>(res.data);
        const val = JSON.parse(data.result.val);
        if(validator(val)){
            throw new Error('Data is corrupted!');
        }
        return val as unknown as T;
    }

    static async load(address: BlockAddress) : Promise<Block|null> {

        const result = await this.loadHelper<RowType>(address, validateRow);
        if(!result) return null;
        return Block.deserialize(result);
    }

}