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
exports.FileKind = void 0;
const fileSystem_1 = require("./fileSystem");
const contract_1 = __importDefault(require("../contract"));
const web3_utils_1 = require("web3-utils");
var FileKind;
(function (FileKind) {
    FileKind[FileKind["Table"] = 0] = "Table";
    FileKind[FileKind["Image"] = 1] = "Image";
    FileKind[FileKind["Video"] = 2] = "Video";
})(FileKind = exports.FileKind || (exports.FileKind = {}));
class File extends fileSystem_1.FileSystem {
    constructor(parent, name, _initialBlockAddress, bufferSize, kind, contractAddress) {
        super(parent, name, fileSystem_1.NodeType.File, bufferSize);
        this._initialBlockAddress = _initialBlockAddress;
        this._oldAddress = null;
        this.kind = kind;
        this._contractAddress = contractAddress;
        this._contract = new contract_1.default(contractAddress);
    }
    get blockAddress() { return this._initialBlockAddress; }
    get contractAddress() { return this._contractAddress; }
    get contract() { return this._contract; }
    share(account, prices) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isShared())
                throw new Error('[File]: File is already shareable!');
            if (this.blockAddress === null) {
                throw new Error('[File]: File is empty');
            }
            this._contract = new contract_1.default();
            const rPrice = (0, web3_utils_1.toWei)(prices.read.amount, prices.read.unit);
            const rwPrice = (0, web3_utils_1.toWei)(prices.readWrite.amount, prices.readWrite.unit);
            yield this._contract.deploy(account, {
                name: this.name,
                rPrice,
                rwPrice,
                blockAddress: this.blockAddress,
            });
            this._contractAddress = this._contract.address;
            return this._contractAddress;
        });
    }
    updateAddressFromContract(account) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isShared())
                return;
            const crt = this.contract;
            const addressOnContractOr = yield crt.getBlockAddress(account);
            if (addressOnContractOr instanceof Error)
                throw addressOnContractOr;
            this._oldAddress = this._initialBlockAddress;
            this._initialBlockAddress = addressOnContractOr;
        });
    }
    resetBlockAddress() {
        if (!this._oldAddress)
            return;
        this._initialBlockAddress = this._oldAddress;
        this._oldAddress = null;
    }
    isShared() { return this.contractAddress !== null; }
    isTable() { return this.kind === FileKind.Table; }
    isImage() { return this.kind === FileKind.Image; }
    isVideo() { return this.kind === FileKind.Video; }
    asTable() {
        return this.isTable() ? this : null;
    }
    getInfo() {
        var _a;
        return ((_a = this.asTable()) === null || _a === void 0 ? void 0 : _a.getInfo()) || {};
    }
    get basename() {
        return this.name.split('.')[0];
    }
    get extension() {
        const arr = this.name.split('.');
        return arr.length >= 2 ? (arr.pop() || '') : '';
    }
    serialize() {
        const table = this.asTable();
        if (table)
            return table.serialize();
        throw new Error('[File]: unknown file kind found!');
    }
}
exports.default = File;
//# sourceMappingURL=file.js.map