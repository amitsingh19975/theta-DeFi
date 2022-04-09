import { ContractInfoType } from "./solc/compileSol";
import Web3 from 'web3';
import { BlockAddress } from "./block";
import { AbiItem, Unit } from "web3-utils";
import { Contract, DeployOptions, SendOptions } from "web3-eth-contract";
import fs from 'fs';
import config from './solcConfig'
import AccountManager from "./accountManager";
import { BasicMarketPayloadType, market, MarketMethod } from "./edgeStore";
import { TableMetadataType } from "./fs/tableFile";
import BN from "bn.js";

export type ChainType = [string, number];

export const ThetaMainnet: ChainType = ['https://eth-rpc-api.thetatoken.org/rpc', 361];
export const ThetaTestnet: ChainType = ['https://eth-rpc-api-testnet.thetatoken.org/rpc', 365];
export const ThetaLocalnet: ChainType = ['http://127.0.0.1:18888/rpc', 366]

const readCompiledContract = () => {
    const data = fs.readFileSync(config.contracts.cache);
    return JSON.parse(data.toString()) as ContractInfoType;
}

const compiledContract = readCompiledContract();


export const toHex = Web3.utils.toHex;

export const toWei = (val: string|number|BN, unit?: Unit) => {
    switch(typeof val) {
    case 'number': return Web3.utils.toWei(val.toString(), unit);
    case 'string': return Web3.utils.toWei(val, unit);
    default: return Web3.utils.toWei(val, unit);
    }
}

export const fromWei = (val: string|number|BN, unit?: Unit) => {
    return Web3.utils.fromWei(typeof val === 'number' ? val.toString(): val, unit);
}

export type ContractArgumentType = {
    name: string,
    blockAddress: string,
    rPrice: string|BN,
    rwPrice: string|BN,
}

export enum AccessLevel {
    NONE = 0,
    READ = 1,
    RW = 2
}

export const SendMethod = 'send';
export const CallMethod = 'call';

type MethodType = 
    | 'name'
    | 'symbol'
    | 'buy'
    | 'updatePrices'
    | 'decimals'
    | 'minAccessLevel'
    | 'maxAccessLevel'
    | 'updatePermission'
    | 'currentAccessLevel'
    | 'amountToPayForLevel'
    | 'getBlockAddress'
    | 'updateBlockAddress'
    | 'myAccessLevel'
    | 'hasNoPerm'
    | 'hasRPerm'
    | 'hasRWPerm'
    | 'getPrices'
    | 'isOwner'
;

type ContractMethodValueType = [MethodType, 'call' | 'send'];

export const ContractMethod = {
    Name                : ['name', CallMethod ] as ContractMethodValueType,               // function name() external view returns(string memory);
    Symbol              : ['symbol', CallMethod ] as ContractMethodValueType,             // function symbol() external view returns(string memory);
    Buy                 : ['buy', SendMethod ] as ContractMethodValueType,                // function buy(uint8 accessLevel) external payable;
    UpdatePrices        : ['updatePrices', SendMethod ] as ContractMethodValueType,       // function updatePrices(uint _readPrice, uint _readWritePrice) public onlyOwner
    Decimals            : ['decimals', CallMethod ] as ContractMethodValueType,           // function decimals() external pure returns(uint8);
    MinAccessLevel      : ['minAccessLevel', CallMethod ] as ContractMethodValueType,     // function minAccessLevel() external pure returns(uint8);
    MaxAccessLevel      : ['maxAccessLevel', CallMethod ] as ContractMethodValueType,     // function maxAccessLevel() external view returns(uint8);
    UpdatePermission    : ['updatePermission', SendMethod ] as ContractMethodValueType,   // function updatePermission(address client, uint8 accessLevel) external;
    CurrentAccessLevel  : ['currentAccessLevel', CallMethod ] as ContractMethodValueType, // function currentAccessLevel(address client) external view returns(uint8);
    AmountToPayForLevel : ['amountToPayForLevel', CallMethod ] as ContractMethodValueType,// function amountToPayForLevel(uint8 lvl) external view returns(uint);
    GetBlockAddress     : ['getBlockAddress', CallMethod ] as ContractMethodValueType,    // function getBlockAddress() public view canReadData returns(bytes memory);
    UpdateBlockAddress  : ['updateBlockAddress', SendMethod ] as ContractMethodValueType, // function updateBlockAddress(bytes memory _address) public canWriteData
    MyAccessLevel       : ['myAccessLevel', CallMethod ] as ContractMethodValueType,      // function myAccessLevel() public view returns(uint8)
    HasNoPerm           : ['hasNoPerm', CallMethod ] as ContractMethodValueType,          // function hasNoPerm() public view returns(bool)
    HasRPerm            : ['hasRPerm', CallMethod ] as ContractMethodValueType,           // function hasRPerm() public view returns(bool)
    HasRWPerm           : ['hasRWPerm', CallMethod ] as ContractMethodValueType,          // function hasRWPerm() public view returns(bool)
    GetPrices           : ['getPrices', CallMethod ] as ContractMethodValueType,          // function getPrices() public view returns(uint[] memory)
    IsOwner             : ['isOwner', CallMethod ] as ContractMethodValueType,            // function isOwner() public view returns(bool)
}

export default class ShareableStorage {
    static _web?: Web3;
    static _chainId?: number
    private _contract: Contract;
    private _transcationHash: BlockAddress = null;
    private _address: BlockAddress = null;

    static init(chain: ChainType) : void {
        this._chainId = chain[1];
        this._web = new Web3(chain[0]);
    }
    
    get address() : BlockAddress { return this._address; }
    get transcationHash() : BlockAddress { return this._transcationHash; }

    constructor(address?: BlockAddress){
        if(!ShareableStorage._web || !ShareableStorage._chainId)
            throw new Error('[ShareableStorage]: "init" was not called!');
        this._address = address || null;
        this._contract = new ShareableStorage._web.eth.Contract(compiledContract.abi as AbiItem[], address || undefined);
    }

    async deploy(args: ContractArgumentType, gas?: number, gasPrice?: string) : Promise<void> {
        if(!ShareableStorage._web || !ShareableStorage._chainId)
            throw new Error('[ShareableStorage]: "init" was not called!');

        const payload: DeployOptions = {
            data: compiledContract.evm.bytecode.object,
            arguments: [args.name, args.blockAddress, args.rPrice, args.rwPrice]
        }

        const params: SendOptions = {
            from: AccountManager.main,
            gas,
            gasPrice,
        }


        this._contract = await this._contract.deploy(payload).send(params)
            .on('error', (err) => {
                throw err;
            }).then((contractInstance) => contractInstance);
        
        this._address = this._contract.options.address;
    }

    private _checkAddress() : void {
        if(this.address === null) {
            throw new Error('[ShareableStorage]: please deploy contract first, or initialize the contract with contract address properly!');
        }
    }

    async updatePrice(rPrice: string, rwPrice: string) : Promise<void> {
        await this.call(ContractMethod.UpdatePrices, [rPrice, rwPrice]);
    }

    async name() : Promise<string|Error> {
        return await this.call(ContractMethod.Name) as string|Error;
    }
    
    async symbol() : Promise<string|Error> {
        return await this.call(ContractMethod.Symbol) as string|Error;
    }
    
    async buy(level: AccessLevel, price: string|BN) : Promise<Record<string,unknown>|Error> {
        return await this.call(ContractMethod.Buy, [level as number], price) as Record<string,unknown>|Error;
    }
    
    async decimals() : Promise<number|Error> {
        return await this.call(ContractMethod.Decimals) as number|Error;
    }
    
    async minAccessLevel() : Promise<AccessLevel|Error> {
        return await this.call(ContractMethod.MinAccessLevel) as AccessLevel|Error;
    }
    
    async maxAccessLevel() : Promise<AccessLevel|Error> {
        return await this.call(ContractMethod.MaxAccessLevel) as AccessLevel|Error;
    }
    
    async getBlockAddress() : Promise<string|Error> {
        return await this.call(ContractMethod.GetBlockAddress) as string|Error;
    }
    
    async currentAccessLevel(clientAddress?: BlockAddress) : Promise<AccessLevel|Error> {
        return await this.call(ContractMethod.CurrentAccessLevel, [clientAddress ?  AccountManager.main : clientAddress]) as AccessLevel|Error;
    }
    
    async myAccessLevel() : Promise<AccessLevel|Error> {
        return await this.call(ContractMethod.MyAccessLevel) as AccessLevel|Error;
    }
    
    async hasNoPerm() : Promise<boolean|Error> {
        return await this.call(ContractMethod.HasNoPerm) as boolean|Error;
    }

    async hasReadPerm() : Promise<boolean|Error> {
        return await this.call(ContractMethod.HasRPerm) as boolean|Error;
    }

    async hasReadWritePerm() : Promise<boolean|Error> {
        return await this.call(ContractMethod.HasRWPerm) as boolean|Error;
    }

    async isOwner() : Promise<boolean|Error> {
        return await this.call(ContractMethod.IsOwner) as boolean|Error;
    }
    
    async getPrices() : Promise<string[]|Error> {
        const errOr = await this.call(ContractMethod.GetPrices) as string[]|Error;
        if(errOr instanceof Error) return errOr;
        return errOr.map(el => fromWei(el, 'Gwei'));
    }
    
    async updatePermission(clientAddress: BlockAddress, level: AccessLevel) : Promise<Record<string,unknown>|Error> {
        if(!clientAddress) return new Error('[ShareableStorage]: client address must be non-null address');
        return await this.call(ContractMethod.UpdatePermission, [clientAddress, level as number]) as Record<string,unknown>|Error;
    }
    
    async amountToPayForLevel(level: AccessLevel) : Promise<Record<string,unknown>|Error> {
        return await this.call(ContractMethod.AmountToPayForLevel, [level as number]) as Record<string,unknown>|Error;
    }
    
    async updateBlockAddress(blockAddress: BlockAddress) : Promise<Record<string,unknown>|Error> {
        if(!blockAddress) return new Error('[ShareableStorage]: block address must be non-null address');
        return await this.call(ContractMethod.UpdateBlockAddress, [blockAddress]) as Record<string,unknown>|Error;
    }

    async call(method: ContractMethodValueType, args?: unknown[], price?: string|BN) : Promise<unknown|Error> {
        this._checkAddress();
        const [methodName, type] = method;
        try {
            return await this._contract.methods[methodName](...args || [])[type]({from: AccountManager.main, value: price})
                .then((res: unknown) => res);
        }catch(err){
            return err;
        }
    }

    static async sellTableOnMarket(address: BlockAddress, desc: BasicMarketPayloadType & { tableInfo: TableMetadataType }): Promise<ShareableStorage|Error> {
        if(!address){
            return new Error('[ShareableStorage]: address cannot be null');
        }

        const crt = new ShareableStorage(address);
        await crt.deploy({
            name: desc.tableInfo.name,
            blockAddress: address,
            rPrice: toWei(desc.readPrice.amount, desc.readPrice.unit as Unit),
            rwPrice: toWei(desc.readWritePrice.amount, desc.readWritePrice.unit as Unit)
        });
        
        const contractAddress = crt.address;
        const res = await market(MarketMethod.AddTable, {...desc, contractAddress});
        if(res.status !== 200 || 'error' in res.data){
            return new Error('[ShareableStorage]: ' + res.data.error.mess);
        }
        return crt;
    }
}
