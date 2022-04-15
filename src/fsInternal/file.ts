import { Directory } from "./directory";
import { NodeType, FileSystem  } from "./fileSystem";
import { BlockAddress } from "../block";
import TableFile, { TableFileSerializeType, TableMetadataType } from "./tableFile";
import { ImageSerializeType } from "./imageFile";
import ShareableStorage from "../contract";
import { Unit } from "web3-utils";
import { getUser } from "../accountManager";

export type FileSerializeType = {
    name: string,
    parent: string,
    type: NodeType,
    kind: FileKind,
    size: number,
    blockAddress: BlockAddress,
    contractAddress: BlockAddress,
    serializedChild?: TableFileSerializeType | ImageSerializeType
}

export enum FileKind{
    Table,
    Image,
    Video
}

type PriceParamType = {
    read: {
        amount: string,
        unit: Unit,
    },
    readWrite: {
        amount: string,
        unit: Unit,
    },
}

export default class File extends FileSystem {
    readonly kind: FileKind;
    protected _contractAddress: BlockAddress;
    protected _contract: ShareableStorage;

    protected constructor(parent: Directory | null, name: string, protected _initialBlockAddress: BlockAddress, bufferSize: number, kind: FileKind, contractAddress: BlockAddress) {
        super(parent, name, NodeType.File, bufferSize);
        this.kind = kind;
        this._contractAddress = contractAddress;
        this._contract = new ShareableStorage(contractAddress);
    }

    get blockAddress() : BlockAddress { return this._initialBlockAddress; }
    get contractAddress() : BlockAddress { return this._contractAddress; }
    get contract() : ShareableStorage { return this._contract; }

    async share(account: string, prices: PriceParamType) : Promise<BlockAddress> {
        if(this.isShared())
            throw new Error('[File]: File is already shareable!');

        const errOr = await ShareableStorage.deployContract(account, this.contractAddress, {
            tableName: this.name,
            readPrice: { ...prices.read },
            readWritePrice: { ...prices.readWrite },
        })

        if(errOr instanceof Error) throw errOr;

        this._contract = errOr;
        this._contractAddress = this._contract.address;
        return this._contractAddress;
    }

    isShared() : boolean { return this.contractAddress !== null; }
    

    isTable() : this is TableFile { return this.kind === FileKind.Table; }
    isImage() : boolean { return this.kind === FileKind.Image; }
    isVideo() : boolean { return this.kind === FileKind.Video; }

    asTable() : TableFile|null { 
        return this.isTable() ? this : null;
    }

    getInfo(): TableMetadataType {
        return this.asTable()?.getInfo() || {} as TableMetadataType;
    }

    get basename() : string {
        return this.name.split('.')[0];
    }
    
    get extension() : string {
        const arr = this.name.split('.');
        return arr.length >= 2 ? (arr.pop() || '') : '';
    }

    serialize() : FileSerializeType {
        const table = this.asTable();
        if(table) return table.serialize();

        throw new Error('[File]: unknown file kind found!');
    }

}