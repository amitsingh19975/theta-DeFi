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
exports.ContractMethod = exports.CallMethod = exports.SendMethod = exports.AccessLevel = exports.fromWei = exports.toWei = exports.toHex = exports.ThetaLocalnet = exports.ThetaTestnet = exports.ThetaMainnet = void 0;
const web3_1 = __importDefault(require("web3"));
const fs_1 = __importDefault(require("fs"));
const solcConfig_1 = __importDefault(require("./solcConfig"));
const accountManager_1 = __importDefault(require("./accountManager"));
const edgeStore_1 = require("./edgeStore");
exports.ThetaMainnet = ['https://eth-rpc-api.thetatoken.org/rpc', 361];
exports.ThetaTestnet = ['https://eth-rpc-api-testnet.thetatoken.org/rpc', 365];
exports.ThetaLocalnet = ['http://127.0.0.1:18888/rpc', 366];
const readCompiledContract = () => {
    const data = fs_1.default.readFileSync(solcConfig_1.default.contracts.cache);
    return JSON.parse(data.toString());
};
const compiledContract = readCompiledContract();
exports.toHex = web3_1.default.utils.toHex;
const toWei = (val, unit) => {
    switch (typeof val) {
        case 'number': return web3_1.default.utils.toWei(val.toString(), unit);
        case 'string': return web3_1.default.utils.toWei(val, unit);
        default: return web3_1.default.utils.toWei(val, unit);
    }
};
exports.toWei = toWei;
const fromWei = (val, unit) => {
    return web3_1.default.utils.fromWei(typeof val === 'number' ? val.toString() : val, unit);
};
exports.fromWei = fromWei;
var AccessLevel;
(function (AccessLevel) {
    AccessLevel[AccessLevel["NONE"] = 0] = "NONE";
    AccessLevel[AccessLevel["READ"] = 1] = "READ";
    AccessLevel[AccessLevel["RW"] = 2] = "RW";
})(AccessLevel = exports.AccessLevel || (exports.AccessLevel = {}));
exports.SendMethod = 'send';
exports.CallMethod = 'call';
exports.ContractMethod = {
    Name: ['name', exports.CallMethod],
    Symbol: ['symbol', exports.CallMethod],
    Buy: ['buy', exports.SendMethod],
    UpdatePrices: ['updatePrices', exports.SendMethod],
    Decimals: ['decimals', exports.CallMethod],
    MinAccessLevel: ['minAccessLevel', exports.CallMethod],
    MaxAccessLevel: ['maxAccessLevel', exports.CallMethod],
    UpdatePermission: ['updatePermission', exports.SendMethod],
    CurrentAccessLevel: ['currentAccessLevel', exports.CallMethod],
    AmountToPayForLevel: ['amountToPayForLevel', exports.CallMethod],
    GetBlockAddress: ['getBlockAddress', exports.CallMethod],
    UpdateBlockAddress: ['updateBlockAddress', exports.SendMethod],
    MyAccessLevel: ['myAccessLevel', exports.CallMethod],
    HasNoPerm: ['hasNoPerm', exports.CallMethod],
    HasRPerm: ['hasRPerm', exports.CallMethod],
    HasRWPerm: ['hasRWPerm', exports.CallMethod],
    GetPrices: ['getPrices', exports.CallMethod],
    IsOwner: ['isOwner', exports.CallMethod], // function isOwner() public view returns(bool)
};
class ShareableStorage {
    constructor(address) {
        this._transcationHash = null;
        this._address = null;
        if (!ShareableStorage._web || !ShareableStorage._chainId)
            throw new Error('[ShareableStorage]: "init" was not called!');
        this._address = address || null;
        this._contract = new ShareableStorage._web.eth.Contract(compiledContract.abi, address || undefined);
    }
    static init(chain) {
        this._chainId = chain[1];
        this._web = new web3_1.default(chain[0]);
    }
    get address() { return this._address; }
    get transcationHash() { return this._transcationHash; }
    deploy(args, gas, gasPrice) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!ShareableStorage._web || !ShareableStorage._chainId)
                throw new Error('[ShareableStorage]: "init" was not called!');
            const payload = {
                data: compiledContract.evm.bytecode.object,
                arguments: [args.name, args.blockAddress, args.rPrice, args.rwPrice]
            };
            const params = {
                from: accountManager_1.default.main,
                gas,
                gasPrice,
            };
            this._contract = yield this._contract.deploy(payload).send(params)
                .on('error', (err) => {
                throw err;
            }).then((contractInstance) => contractInstance);
            this._address = this._contract.options.address;
        });
    }
    _checkAddress() {
        if (this.address === null) {
            throw new Error('[ShareableStorage]: please deploy contract first, or initialize the contract with contract address properly!');
        }
    }
    updatePrice(rPrice, rwPrice) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.call(exports.ContractMethod.UpdatePrices, [rPrice, rwPrice]);
        });
    }
    name() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.call(exports.ContractMethod.Name);
        });
    }
    symbol() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.call(exports.ContractMethod.Symbol);
        });
    }
    buy(level, price) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.call(exports.ContractMethod.Buy, [level], price);
        });
    }
    decimals() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.call(exports.ContractMethod.Decimals);
        });
    }
    minAccessLevel() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.call(exports.ContractMethod.MinAccessLevel);
        });
    }
    maxAccessLevel() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.call(exports.ContractMethod.MaxAccessLevel);
        });
    }
    getBlockAddress() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.call(exports.ContractMethod.GetBlockAddress);
        });
    }
    currentAccessLevel(clientAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.call(exports.ContractMethod.CurrentAccessLevel, [clientAddress ? accountManager_1.default.main : clientAddress]);
        });
    }
    myAccessLevel() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.call(exports.ContractMethod.MyAccessLevel);
        });
    }
    hasNoPerm() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.call(exports.ContractMethod.HasNoPerm);
        });
    }
    hasReadPerm() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.call(exports.ContractMethod.HasRPerm);
        });
    }
    hasReadWritePerm() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.call(exports.ContractMethod.HasRWPerm);
        });
    }
    isOwner() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.call(exports.ContractMethod.IsOwner);
        });
    }
    getPrices() {
        return __awaiter(this, void 0, void 0, function* () {
            const errOr = yield this.call(exports.ContractMethod.GetPrices);
            if (errOr instanceof Error)
                return errOr;
            return errOr.map(el => (0, exports.fromWei)(el, 'Gwei'));
        });
    }
    updatePermission(clientAddress, level) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!clientAddress)
                return new Error('[ShareableStorage]: client address must be non-null address');
            return yield this.call(exports.ContractMethod.UpdatePermission, [clientAddress, level]);
        });
    }
    amountToPayForLevel(level) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.call(exports.ContractMethod.AmountToPayForLevel, [level]);
        });
    }
    updateBlockAddress(blockAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!blockAddress)
                return new Error('[ShareableStorage]: block address must be non-null address');
            return yield this.call(exports.ContractMethod.UpdateBlockAddress, [blockAddress]);
        });
    }
    call(method, args, price) {
        return __awaiter(this, void 0, void 0, function* () {
            this._checkAddress();
            const [methodName, type] = method;
            try {
                return yield this._contract.methods[methodName](...args || [])[type]({ from: accountManager_1.default.main, value: price })
                    .then((res) => res);
            }
            catch (err) {
                return err;
            }
        });
    }
    static sellTableOnMarket(address, desc) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!address) {
                return new Error('[ShareableStorage]: address cannot be null');
            }
            const crt = new ShareableStorage(address);
            yield crt.deploy({
                name: desc.tableInfo.name,
                blockAddress: address,
                rPrice: (0, exports.toWei)(desc.readPrice.amount, desc.readPrice.unit),
                rwPrice: (0, exports.toWei)(desc.readWritePrice.amount, desc.readWritePrice.unit)
            });
            const contractAddress = crt.address;
            const res = yield (0, edgeStore_1.market)(edgeStore_1.MarketMethod.AddTable, Object.assign(Object.assign({}, desc), { contractAddress }));
            if (res.status !== 200 || 'error' in res.data) {
                return new Error('[ShareableStorage]: ' + res.data.error.mess);
            }
            return crt;
        });
    }
}
exports.default = ShareableStorage;
//# sourceMappingURL=contract.js.map