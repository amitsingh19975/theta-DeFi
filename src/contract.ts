import { ContractInfoType } from "./solc/compileSol";
import Web3 from 'web3';
import { BlockAddress } from "./block";
import { AbiItem, Unit } from "web3-utils";
import { Contract, DeployOptions, SendOptions } from "web3-eth-contract";
import AccountManager from "./accountManager";
import { BasicMarketPayloadType, ChainType } from "./edgeStore";
import BN from "bn.js";

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
    static _compiledContract?: ContractInfoType;
    static _web?: Web3;
    static _chainId?: number
    private _contract: Contract;
    private _transcationHash: BlockAddress = null;
    private _address: BlockAddress = null;

    static init(chain: ChainType, compiledContract: ContractInfoType) : void {
        this._chainId = chain.chainID;
        this._web = new Web3(chain.url);
        this._compiledContract = compiledContract;
    }
    
    get address() : BlockAddress { return this._address; }
    get transcationHash() : BlockAddress { return this._transcationHash; }

    constructor(contractAddress?: BlockAddress){
        if(!ShareableStorage._web || !ShareableStorage._chainId || !ShareableStorage._compiledContract)
            throw new Error('[ShareableStorage]: "init" was not called!');
        this._address = contractAddress || null;
        this._contract = new ShareableStorage._web.eth.Contract(ShareableStorage._compiledContract.abi as AbiItem[], contractAddress || undefined);
    }

    async deploy(account: string, args: ContractArgumentType, gas?: number, gasPrice?: string) : Promise<void> {
        if(!ShareableStorage._web || !ShareableStorage._chainId || !ShareableStorage._compiledContract)
            throw new Error('[ShareableStorage]: "init" was not called!');

        const payload: DeployOptions = {
            data: ShareableStorage._compiledContract.evm.bytecode.object,
            arguments: [args.name, args.blockAddress, args.rPrice, args.rwPrice]
        }

        const params: SendOptions = {
            from: account,
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

    async updatePrice(account: string, rPrice: string, rwPrice: string) : Promise<void> {
        await this.call(account, ContractMethod.UpdatePrices, [rPrice, rwPrice]);
    }

    async name(account: string) : Promise<string|Error> {
        return await this.call(account, ContractMethod.Name) as string|Error;
    }
    
    async symbol(account: string) : Promise<string|Error> {
        return await this.call(account, ContractMethod.Symbol) as string|Error;
    }
    
    async buy(account: string, level: AccessLevel, price: string|BN) : Promise<Record<string,unknown>|Error> {
        return await this.call(account, ContractMethod.Buy, [level as number], price) as Record<string,unknown>|Error;
    }
    
    async decimals(account: string) : Promise<number|Error> {
        return await this.call(account, ContractMethod.Decimals) as number|Error;
    }
    
    async minAccessLevel(account: string) : Promise<AccessLevel|Error> {
        return await this.call(account, ContractMethod.MinAccessLevel) as AccessLevel|Error;
    }
    
    async maxAccessLevel(account: string) : Promise<AccessLevel|Error> {
        return await this.call(account, ContractMethod.MaxAccessLevel) as AccessLevel|Error;
    }
    
    async getBlockAddress(account: string) : Promise<string|Error> {
        return await this.call(account, ContractMethod.GetBlockAddress) as string|Error;
    }
    
    async currentAccessLevel(account: string, clientAddress?: BlockAddress) : Promise<AccessLevel|Error> {
        return await this.call(account, ContractMethod.CurrentAccessLevel, [clientAddress ? account : clientAddress]) as AccessLevel|Error;
    }
    
    async myAccessLevel(account: string) : Promise<AccessLevel|Error> {
        return await this.call(account, ContractMethod.MyAccessLevel) as AccessLevel|Error;
    }
    
    async hasNoPerm(account: string) : Promise<boolean|Error> {
        return await this.call(account, ContractMethod.HasNoPerm) as boolean|Error;
    }

    async hasReadPerm(account: string) : Promise<boolean|Error> {
        return await this.call(account, ContractMethod.HasRPerm) as boolean|Error;
    }

    async hasReadWritePerm(account: string) : Promise<boolean|Error> {
        return await this.call(account, ContractMethod.HasRWPerm) as boolean|Error;
    }

    async isOwner(account: string) : Promise<boolean|Error> {
        return await this.call(account, ContractMethod.IsOwner) as boolean|Error;
    }
    
    async getPrices(account: string) : Promise<string[]|Error> {
        const errOr = await this.call(account, ContractMethod.GetPrices) as string[]|Error;
        if(errOr instanceof Error) return errOr;
        return errOr;
    }
    
    async updatePermission(account: string, clientAddress: BlockAddress, level: AccessLevel) : Promise<Record<string,unknown>|Error> {
        if(!clientAddress) return new Error('[ShareableStorage]: client address must be non-null address');
        return await this.call(account, ContractMethod.UpdatePermission, [clientAddress, level as number]) as Record<string,unknown>|Error;
    }
    
    async amountToPayForLevel(account: string, level: AccessLevel) : Promise<Record<string,unknown>|Error> {
        return await this.call(account, ContractMethod.AmountToPayForLevel, [level as number]) as Record<string,unknown>|Error;
    }
    
    async updateBlockAddress(account: string, blockAddress: BlockAddress) : Promise<Record<string,unknown>|Error> {
        if(!blockAddress) return new Error('[ShareableStorage]: block address must be non-null address');
        return await this.call(account, ContractMethod.UpdateBlockAddress, [blockAddress]) as Record<string,unknown>|Error;
    }

    async call(account: string, method: ContractMethodValueType, args?: unknown[], price?: string|BN) : Promise<unknown|Error> {
        this._checkAddress();
        const [methodName, type] = method;
        try {
            return await this._contract.methods[methodName](...args || [])[type]({from: account, value: price})
                .then((res: unknown) => res);
        }catch(err){
            return err;
        }
    }
}
