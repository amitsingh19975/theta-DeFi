declare module "accountManager" {
    import Web3 from 'web3';
    export default class AccountManager {
        static accounts: string[];
        static currentIdx: number;
        static init(web?: Web3): Promise<boolean>;
        static get main(): string;
    }
    export const getUser: () => Promise<{
        name: string;
        address: string;
    }>;
}
declare module "solc/error" {
    type ErrorType = 'TypeError' | 'JSONError' | 'IOError' | 'ParserError' | 'DocstringParsingError' | 'SyntaxError' | 'DeclarationError' | 'UnimplementedFeatureError' | 'InternalCompilerError' | 'Exception' | 'CompilerError' | 'FatalError' | 'Warning' | 'DocstringParsingError';
    type SeverityType = 'error' | 'warning' | 'info';
    export type SourceLocationType = {
        file: string;
        start: number;
        end: number;
    };
    export type ErrorObjectType = {
        sourceLocation?: SourceLocationType;
        secondarySourceLocations?: (SourceLocationType & {
            message: string;
        })[];
        type: ErrorType;
        component: string;
        severity: SeverityType;
        message: string;
        formattedMessage?: string;
        errorCode?: number;
    };
    export const throwOrWarnSolError: (solErrorObj: ErrorObjectType) => void;
}
declare module "solc/globContracts" {
    type SolFile = {
        path: string;
        content: string;
    };
    export const globSolFiles: (path: string) => SolFile[];
}
declare module "solc/compileSol" {
    import { ErrorObjectType } from "solc/error";
    export type userConfiguration = {
        contracts: {
            path: string;
            cache: string;
        };
    };
    export type InSourcesType = {
        [key: string]: {
            content?: string;
            keccak256?: string;
            urls?: string[];
        };
    };
    export type OutputSelectionType = {
        [key: string]: {
            [key: string]: string[];
        };
    };
    export type SolInputType = {
        language: string;
        sources: InSourcesType;
        settings?: {
            outputSelection: OutputSelectionType;
            optimizer?: {
                enabled: boolean;
                runs: number;
                details?: {
                    peephole?: boolean;
                    inliner?: boolean;
                    jumpdestRemover?: boolean;
                    orderLiterals?: boolean;
                    deduplicate?: boolean;
                    cse?: boolean;
                    constantOptimizer?: boolean;
                    yul?: boolean;
                    yulDetails?: {
                        stackAllocation?: boolean;
                        optimizerSteps?: string;
                    };
                };
            };
            remappings?: string[];
            evmVersion?: "homestead" | "tangerineWhistle" | "spuriousDragon" | "byzantium" | "constantinople";
            metadata?: {
                useLiteralContent?: boolean;
                bytecodeHash?: "none" | "ipfs" | "bzzr1";
            };
            libraries?: {
                [key: string]: {
                    [key: string]: string;
                };
            };
            stopAfter?: string;
            viaIR?: boolean;
            debug?: {
                revertStrings?: "default" | "strip" | "debug" | "verboseDebug";
                debugInfo?: ("location" | "snippet" | "*")[];
            };
            modelChecker?: {
                contracts?: {
                    [key: string]: string[];
                };
                divModNoSlacks?: boolean;
                engine?: "all" | "bmc" | "chc" | "none";
                invariants?: ("contract" | "reentrancy")[];
                showUnproved?: boolean;
                solvers?: string[];
                targets?: string[];
                timeout?: number;
            };
        };
    };
    export type OutSourcesType = {
        [key: string]: {
            id: number;
            ast: {
                [key: string]: unknown;
            };
            legacyAST?: {
                [key: string]: unknown;
            };
        };
    };
    export type NatSpecDocumentationType = {
        version: number;
    } & {
        [key: string]: unknown;
    };
    export type UserNatSpecDocumentationType = {
        kind: "user";
    } & NatSpecDocumentationType;
    export type DeveloperNatSpecDocumentationType = {
        kind: "dev";
    } & NatSpecDocumentationType;
    export type InputsComponentsType = {
        name: string;
        type: string;
        components?: InputsComponentsType;
    }[];
    export type InputsType = {
        name: string;
        type: string;
        components?: InputsComponentsType;
        indexed?: boolean;
    }[];
    export type ContractABIType = {
        type: "function" | "constructor" | "receive" | "fallback";
        name?: string;
        inputs: InputsType;
        outputs?: InputsType;
        stateMutability?: "pure" | "view" | "nonpayable" | "payable";
        anonymous?: boolean;
    };
    export type ContractInfoType = {
        abi: ContractABIType[];
        metadata: string;
        userdoc: UserNatSpecDocumentationType;
        devdoc: DeveloperNatSpecDocumentationType;
        ir: string;
        evm: {
            assembly: string;
            legacyAssembly?: {
                [key: string | symbol]: unknown;
            };
            bytecode: {
                object: string;
                opcodes: string;
                sourceMap: string;
                linkReferences: {
                    [key: string]: {
                        [key: string]: {
                            start: number;
                            length: number;
                        }[];
                    };
                };
                generatedSources: {
                    ast: {
                        [key: string]: string;
                    };
                    contents: string;
                    id: number;
                    language: string;
                    name: string;
                }[];
            };
            deployedBytecode: {
                [key: string]: {
                    [key: string]: {
                        start: number;
                        length: number;
                    }[];
                };
            };
            methodIdentifiers: {
                [key: string]: string;
            };
            gasEstimates: {
                creation: {
                    codeDepositCost: string;
                    executionCost: string;
                    totalCost: string;
                };
                external: {
                    [key: string]: string;
                };
                internal: {
                    [key: string]: string;
                };
            };
        };
        ewasm: {
            wast: string;
            wasm: string;
        };
        storageLayout?: {
            storage: {
                astId: number;
                contract: string;
                label: string;
                offset: number;
                slot: string;
                type: string;
            }[];
            types: {
                [key: string]: {
                    encoding: "inplace" | "mapping" | "dynamic_array" | "bytes";
                    label: string;
                    numberOfBytes: number;
                };
            };
        };
    };
    export type ContractNameType = {
        [key: string | symbol]: ContractInfoType;
    };
    export type OutContractsType = {
        [key: string]: ContractNameType;
    };
    export type SolOutputType = {
        errors?: ErrorObjectType[];
        sources: OutSourcesType;
        contracts: OutContractsType;
    };
    export default class SolCompiler {
        private readonly _config;
        private readonly _compilerOutputSelection?;
        private readonly _runs;
        private _output;
        private _contracts;
        constructor(_config: userConfiguration, _compilerOutputSelection?: OutputSelectionType | undefined, _runs?: number);
        get output(): SolOutputType;
        private _compileHelper;
        compile(): ContractNameType;
        private _setContracts;
        private _checkErrors;
        get contracts(): ContractNameType;
    }
}
declare module "fsInternal/fileSystem" {
    import { Directory, SerializationType } from "fsInternal/directory";
    import File from "fsInternal/file";
    export enum NodeType {
        None = 0,
        File = 1,
        Dir = 2
    }
    export class FileSystem {
        private _name;
        private _parent;
        private _type;
        protected _size: number;
        constructor(parent: Directory | null, name: string, type: NodeType, size?: number, isRoot?: boolean);
        private setNewParent;
        private setSize;
        protected addSizeUsingNode(node: FileSystem | null): void;
        protected removeSizeUsingNode(node: FileSystem | null): void;
        get name(): string;
        set name(newName: string);
        get realName(): string;
        get parent(): Directory | null;
        set parent(newParent: Directory | null);
        get type(): NodeType;
        get size(): number;
        set size(size: number);
        forEach(fn: (node: FileSystem) => void): void;
        private forEachHelper;
        isDir(): this is Directory;
        isFile(): this is File;
        asDir(): Directory | null;
        asFile(): File | null;
        isRoot(): boolean;
        asNode(): FileSystem;
        isEqual(node: FileSystem, strict?: boolean): boolean;
        serialize(): SerializationType;
        private serializeHelper;
    }
}
declare module "fsInternal/imageFile" {
    import { Directory } from "fsInternal/directory";
    import { BlockAddress } from "block";
    import File, { FileSerializeType } from "fsInternal/file";
    export type ImageSerializeType = {
        height: number;
        width: number;
    };
    export default class ImageFile extends File {
        protected _initialBlockAddress: BlockAddress;
        private _height;
        private _width;
        protected constructor(parent: Directory | null, name: string, _initialBlockAddress: BlockAddress, height: number, width: number);
        get blockAddress(): BlockAddress;
        serialize(): FileSerializeType;
    }
}
declare module "fsInternal/file" {
    import { Directory } from "fsInternal/directory";
    import { NodeType, FileSystem } from "fsInternal/fileSystem";
    import { BlockAddress } from "block";
    import TableFile, { TableFileSerializeType, TableMetadataType } from "fsInternal/tableFile";
    import { ImageSerializeType } from "fsInternal/imageFile";
    import ShareableStorage from "contract";
    import { Unit } from "web3-utils";
    export type FileSerializeType = {
        name: string;
        parent: string;
        type: NodeType;
        kind: FileKind;
        size: number;
        blockAddress: BlockAddress;
        contractAddress: BlockAddress;
        serializedChild?: TableFileSerializeType | ImageSerializeType;
    };
    export enum FileKind {
        Table = 0,
        Image = 1,
        Video = 2
    }
    type PriceParamType = {
        read: {
            amount: string;
            unit: Unit;
        };
        readWrite: {
            amount: string;
            unit: Unit;
        };
    };
    export default class File extends FileSystem {
        protected _initialBlockAddress: BlockAddress;
        readonly kind: FileKind;
        protected _contractAddress: BlockAddress;
        protected _contract: ShareableStorage;
        protected constructor(parent: Directory | null, name: string, _initialBlockAddress: BlockAddress, bufferSize: number, kind: FileKind, contractAddress: BlockAddress);
        get blockAddress(): BlockAddress;
        get contractAddress(): BlockAddress;
        get contract(): ShareableStorage;
        share(account: string, prices: PriceParamType): Promise<BlockAddress>;
        updateAddressFromContract(account: string): Promise<void>;
        isShared(): boolean;
        isTable(): this is TableFile;
        isImage(): boolean;
        isVideo(): boolean;
        asTable(): TableFile | null;
        getInfo(): TableMetadataType;
        get basename(): string;
        get extension(): string;
        serialize(): FileSerializeType;
    }
}
declare module "fsInternal/directory" {
    import { FileSerializeType } from "fsInternal/file";
    import { NodeType, FileSystem } from "fsInternal/fileSystem";
    export type SerializationType = DirectorySerializeType | FileSerializeType;
    export type DirectorySerializeType = {
        name: string;
        parent: string;
        type: NodeType;
        children: SerializationType[];
        size: number;
        isRoot: boolean;
    };
    export class Directory extends FileSystem {
        #private;
        private _children;
        private constructor();
        static make(parent: Directory | null, name: string): Directory;
        get children(): FileSystem[];
        setSizeWithoutUpdatingParent(size: number): void;
        static get root(): Directory;
        getChild(childName: string): FileSystem | null;
        addChild(child: FileSystem): FileSystem;
        removeChild(child: FileSystem): boolean;
        removeChildAt(idx: number): boolean;
        addChildren(children: FileSystem[]): void;
        removeChildren(children: FileSystem[]): void;
        removeAll(): void;
        serialize(): DirectorySerializeType;
    }
}
declare module "fsInternal/types" {
    enum Type {
        Int = 0,
        Float = 1,
        String = 2,
        Boolean = 3
    }
    export type BasicAcceptableType = number | string | boolean | null;
    export type AcceptableType = BasicAcceptableType | AcceptableType[];
    export class BasicType {
        private readonly _type;
        private readonly _canBeNull;
        readonly _arrayDepth: number;
        constructor(_type: Type, canBeNull?: boolean[] | boolean, arrayDepth?: number);
        get isInt(): boolean;
        get isFloat(): boolean;
        get isStr(): boolean;
        get isBool(): boolean;
        static make(obj: Record<string, unknown>): BasicType;
        private typeToGraphQLType;
        private toStringHelper;
        toStr(): string;
        canBeNull(depth?: number): boolean;
        private checkConstraintsHelper;
        private checkConstraintsArray;
        checkConstraints(val: AcceptableType): [boolean, string];
        private _checkNumber;
        private _parseNumber;
        private _parseBool;
        parseType(data: unknown): BasicAcceptableType;
    }
    export function Int(canBeNullDepth?: boolean[] | boolean, arrayDepth?: number): BasicType;
    export function Str(canBeNullDepth?: boolean[] | boolean, arrayDepth?: number): BasicType;
    export function Bool(canBeNullDepth?: boolean[] | boolean, arrayDepth?: number): BasicType;
    export function Float(canBeNullDepth?: boolean[] | boolean, arrayDepth?: number): BasicType;
}
declare module "fsInternal/tableInfo" {
    import { Int, Float, Str, Bool, BasicType, AcceptableType } from "fsInternal/types";
    import { BlockType } from "block";
    export { Int, Float, Str, Bool };
    type MapType = (data: AcceptableType) => AcceptableType;
    type FilterType = (data: AcceptableType) => boolean;
    export type FieldType = {
        name: string;
        type: BasicType;
        description?: string;
        map?: MapType;
        filter?: FilterType;
    };
    type InternalFieldType = {
        name: string;
        type: BasicType;
        description: string;
        map: MapType;
        filter: FilterType;
    };
    export const defaultMapFn: (data: AcceptableType) => AcceptableType;
    export const defaultFilterFn: () => boolean;
    export type TableInfoInterface = {
        tableName: string;
        fields: InternalFieldType[];
        source: string;
        description: string;
    };
    export class TableInfo {
        readonly tableName: string;
        private fields;
        readonly source: string;
        description: string;
        constructor(tableName: string, source?: string, description?: string, fields?: FieldType[]);
        getField(name: string): InternalFieldType | null;
        addField(field: FieldType): boolean;
        parseType(key: string, data: unknown): AcceptableType;
        get keys(): string[];
        forEach(callback: (el: InternalFieldType, idx: number, arr: InternalFieldType[]) => void): void;
        validateType(name: string, data: AcceptableType, callback: (valid: boolean, dataAfterMapping: AcceptableType, err?: string) => void): void;
        buildRow(args: BlockType): BlockType;
        updateMapFn(name: string, map: MapType): boolean;
        updateFilterFn(name: string, filter: FilterType): boolean;
        static fromGraphQLSource(source: string): TableInfo;
        serialize(): TableInfoInterface;
        static deserialize(json: TableInfoInterface): TableInfo;
    }
}
declare module "cache" {
    import { Block, BlockAddress } from "block";
    export default class RangeCache {
        private _data;
        private _address;
        private _start;
        private _end;
        constructor();
        get size(): number;
        get data(): Map<number, [Block, BlockAddress]>;
        private deleteRange;
        private doesOverlap;
        setRange(start: number, end: number): void;
        forEach(callbackfn: (value: [Block, BlockAddress], key: number, map: Map<number, [Block, BlockAddress]>) => void): void;
        clear(): void;
        inRange(indexOrAddress: number | BlockAddress): boolean;
        get(indexOrAddress: number | BlockAddress): Block | null;
        delete(indexOrAddress: number | BlockAddress): void;
        add(index: number, block: Block, address: BlockAddress): boolean;
        pushBack(block: Block, address: BlockAddress): boolean;
    }
}
declare module "store" {
    import { Block, BlockAddress, BlockType } from "block";
    import { EdgeStoreConfigType } from "edgeStore";
    type localStoragePlugin = {
        commit: ((blockAddress: BlockAddress, block: Block) => void);
        update: ((oldAddress: BlockAddress, newAddress: BlockAddress) => void);
    };
    export class Store {
        static lastBlockAddress: BlockAddress;
        static storagePlugin?: localStoragePlugin;
        static setPlugin(storagePlugin: localStoragePlugin): void;
        static init(config?: EdgeStoreConfigType): Promise<void>;
        private static _checkConnection;
        private static parseError;
        private static checkError;
        private static getResult;
        private static checkStatus;
        static push(block: Block, payload: BlockType): boolean;
        static pushAndIfFullCommit(block: Block, payload: BlockType): Promise<Block | null>;
        private static commitHelper;
        static commit(block: Block): Promise<Block | null>;
        private static loadHelper;
        static load(address: BlockAddress): Promise<Block | null>;
    }
}
declare module "blockManager" {
    import { Block, BlockAddress, BlockType } from "block";
    export class BlockManager {
        private readonly contractAddress;
        private readonly keys;
        private _initialAddress;
        private numberOfCachedBlocks;
        private _block;
        private _cachedBlocks;
        private _start;
        private lastLoadedAddress;
        private _committedBlocks;
        private _tempSize;
        private constructor();
        static make(contractAddress: BlockAddress, keys: string[], initialAddress: BlockAddress, numberOfCachedBlocks?: number): Promise<BlockManager>;
        get canCommit(): boolean;
        get initialAddress(): BlockAddress;
        get height(): number;
        get currentBlockSize(): number;
        get tempSize(): number;
        private inCacheBlock;
        private findInCachedBlock;
        private clearCache;
        private skipBlocks;
        loadChunkFromInitialAddress(start: number, size: number): Promise<boolean>;
        loadChunkFromAddress(address: BlockAddress, start: number, size: number): Promise<boolean>;
        loadNextChunk(): Promise<boolean>;
        loadPrevChunk(): Promise<boolean>;
        getBlocks(): Block[];
        private _flattenBlock;
        getData(): Record<string, unknown>[];
        private loadBlock;
        pushRow: (row: BlockType, commitIfFull?: boolean, callbackOnCommit?: (() => void) | undefined) => Promise<boolean>;
        commit: (callbackOnCommit?: (() => void) | undefined) => Promise<boolean>;
    }
}
declare module "path" {
    import { Directory } from "fsInternal/directory";
    import { FileSystem } from "fsInternal/fileSystem";
    export enum ComponentKind {
        RootDir = 0,
        CurDir = 1,
        ParentDir = 2,
        Normal = 3
    }
    type Component = {
        kind: ComponentKind;
        text?: string;
    };
    export const pathToComponentsHelper: (path: string[]) => Component[];
    export const pathToComponents: (path: string | string[]) => Component[];
    export class Path {
        static exists(path: string | string[], root?: Directory): boolean;
        static getPath(fs: FileSystem): string;
        static samePath(leftFS: FileSystem | string, rightFS: FileSystem | string, strict?: boolean): boolean;
        private static samePathFF;
        private static samePathSS;
        private static samePathSF;
        private static samePathFS;
    }
}
declare module "fs" {
    import { Directory, DirectorySerializeType, SerializationType } from "fsInternal/directory";
    import File, { FileSerializeType } from "fsInternal/file";
    import { FileSystem, NodeType } from "fsInternal/fileSystem";
    import { BlockAddress } from "block";
    import { Path } from "path";
    import TableFile from "fsInternal/tableFile";
    export { Directory, File, FileSystem, NodeType, Path };
    export const makeDir: (path: string | string[], root?: Directory | undefined) => Directory | null;
    export const makeTable: (name: string, fileInfoOrGraphqlSourceCode?: string | undefined, blockAddress?: BlockAddress | undefined, size?: number | undefined, root?: Directory | undefined) => TableFile;
    export const serializeFileSystem: (root?: Directory | undefined) => string;
    export const deserializeDir: (dir: DirectorySerializeType, parent?: Directory | undefined) => void;
    export const deserializeFile: (file: FileSerializeType, parent: Directory) => void;
    export const deserializeFileSystem: (serializedObject: string | SerializationType, parent?: Directory | undefined) => Directory;
    export const getDirOrFile: (path: string | string[], root?: Directory | undefined) => FileSystem | null;
    export const getDir: (path: string | string[], root?: Directory | undefined) => Directory | null;
    export const getFile: (path: string | string[], root?: Directory | undefined) => File | null;
    export const getSharedFileSystem: (fs: SerializationType, arr?: SerializationType[]) => never;
}
declare module "fsInternal/tableFile" {
    import { Directory } from "fsInternal/directory";
    import { TableInfo as TableInfo } from "fsInternal/tableInfo";
    import { TableInfoInterface } from "fsInternal/tableInfo";
    import { BlockDataType } from "edgeStore";
    import { AcceptableType } from "fsInternal/types";
    import { GraphQLSchema } from "graphql";
    import { Block, BlockAddress } from "block";
    import File, { FileSerializeType } from "fsInternal/file";
    export type TableFileSerializeType = {
        tableInfo: TableInfoInterface;
    };
    export type FieldsType = {
        name: string;
        type: string;
        description: string;
    };
    export type TableMetadataType = {
        description: string;
        path: string;
        name: string;
        size: number;
        source: string;
        height: number;
        fields: [FieldsType];
    };
    type GraphQLResolverFnType = ((args?: Record<string, unknown>) => GraphQLResolverReturnType);
    type GraphQLResolverReturnType = AcceptableType | BlockDataType | TableMetadataType | Promise<AcceptableType | BlockDataType | void | TableMetadataType> | void;
    type GraphQLResolverType = {
        [key: string | symbol]: GraphQLResolverFnType;
    };
    export const buildArgsFromFields: (fileInfo: TableInfo, sep?: string) => string;
    export const buildInputType: (fileInfo: TableInfo) => string[];
    export type GraphQLExecArgsType = {
        funcName: string;
        args?: unknown;
        type: 'Mutation' | 'Query';
    };
    export type GraphQLExecCallbackType = (args: GraphQLExecArgsType) => void;
    export default class TableFile extends File {
        private _tableInfo;
        private _height;
        private _manager?;
        _callback?: GraphQLExecCallbackType;
        _committedCallback?: () => void;
        private constructor();
        static make(parent: Directory | null, name: string, fileInfoOrGraphqlSourceCode: TableInfo | string, blockAddress?: BlockAddress, bufferSize?: number, contractAddress?: BlockAddress): TableFile;
        init(): Promise<void>;
        setCallback(callback: GraphQLExecCallbackType): void;
        setCommittedCallback(callback: () => void): void;
        get approxSize(): number;
        get tableInfo(): TableInfo;
        get tableName(): string;
        get keys(): string[];
        get height(): number;
        get currentBlocks(): Block[];
        get rows(): Record<string, unknown>[];
        private _pushRow;
        private makeGraphQLMutationResolver;
        parseTypes(data: Record<string, unknown>): Record<string, unknown>;
        getInfo(): TableMetadataType;
        makeGraphQLResolver(): GraphQLResolverType;
        makeGraphQLSchema(): GraphQLSchema;
        get basename(): string;
        get extension(): string;
        static deserialize(file: FileSerializeType): File;
        serialize(): FileSerializeType;
    }
}
declare module "edgeStore" {
    import { Block, BlockAddress, BlockType } from "block";
    export type ChainType = {
        url: string;
        chainID: number;
    };
    export const ThetaMainnet: ChainType;
    export const ThetaTestnet: ChainType;
    export const ThetaLocalnet: ChainType;
    export const MAX_BLOCK_SIZE = 1024;
    export type EdgeStoreConfigType = {
        protocol?: string;
        domain?: string;
        port?: number;
        market?: {
            domain?: string;
            port?: number;
        };
    };
    export const EdgeStoreConfig: {
        protocol: string;
        domain: string;
        port: number | null;
        market: {
            domain: string;
            port: number;
        };
    };
    export const initializeEdgeStore: (config?: EdgeStoreConfigType | undefined) => {
        protocol: string;
        domain: string;
        port: number | null;
        market: {
            domain: string;
            port: number;
        };
    };
    type URLArgsType = {
        protocol: string;
        domain: string;
        port?: number;
        suffix?: string;
    };
    export const makeURLFromArgs: ({ protocol, domain, port, suffix }: URLArgsType) => string;
    export const makeEdgeStoreURL: () => string;
    export const makeMarketURL: () => string;
    export const URLS: {
        edgeStoreURL: string;
        marketURL: string;
        thetanet: ChainType;
    };
    export const LOCALSERVER_BASE_URL = "";
    export const MAIN_URL: {
        edgeStore: string;
        thetanet: string;
    };
    type EdgeResponeBaseType = {
        jsonrpc: string;
        id: string | number | boolean | null | undefined;
    };
    export type GetVersionType = EdgeResponeBaseType & {
        result: {
            version: string;
            git_hash: string;
            timestamp: string;
        };
    };
    export type GetStatusType = EdgeResponeBaseType & {
        result: {
            id: string;
            current_time: string;
        };
    };
    export type GetPeersType = EdgeResponeBaseType & {
        result: {
            peers: string[];
        };
    };
    export type PutDataType = EdgeResponeBaseType & {
        result: {
            key: string;
            success: boolean;
        };
    };
    export type GetDataType = EdgeResponeBaseType & {
        result: {
            val: string;
        };
    };
    export type PutFileType = EdgeResponeBaseType & {
        result: {
            key: string;
            relpath: string;
            success: boolean;
        };
    };
    export type GetFileType = EdgeResponeBaseType & {
        result: {
            path: string;
        };
    };
    export type ErrorType = EdgeResponeBaseType & {
        error: {
            code: number;
            message: string;
        };
    };
    export type EdgeResponeType = GetVersionType | GetStatusType | GetPeersType | PutDataType | GetDataType | PutFileType | GetFileType | ErrorType;
    export type BlockDataType = BlockType[];
    export type RowType = {
        data: BlockDataType;
        size: number;
        next: BlockAddress;
        height: number;
    };
    export type StorageType = {
        [key: symbol]: RowType | string;
    };
    export const validateRow: (row: BlockDataType) => boolean;
    export const validateAddress: (row: BlockDataType) => boolean;
    export type WindowType = Window & typeof globalThis & {
        'IS_LOCAL'?: boolean;
    };
    export const getVersion: (id: number | string, params?: Block | StorageType | undefined) => Promise<import("axios").AxiosResponse<any, any>>;
    export const getStatus: (id: number | string, params?: Block | StorageType | undefined) => Promise<import("axios").AxiosResponse<any, any>>;
    export const getPeers: (id: number | string, params?: Block | StorageType | undefined) => Promise<import("axios").AxiosResponse<any, any>>;
    export const putData: (id: number | string, params?: Block | StorageType | undefined) => Promise<import("axios").AxiosResponse<any, any>>;
    export const getData: (id: number | string, params?: Block | StorageType | undefined) => Promise<import("axios").AxiosResponse<any, any>>;
    export const putFile: (id: number | string, params?: Block | StorageType | undefined) => Promise<import("axios").AxiosResponse<any, any>>;
    export const getFile: (id: number | string, params?: Block | StorageType | undefined) => Promise<import("axios").AxiosResponse<any, any>>;
    export type BasicMarketPayloadType = {
        tableName: string;
        readPrice: {
            amount: string;
            unit: string;
        };
        readWritePrice: {
            amount: string;
            unit: string;
        };
        blockAddress: BlockAddress;
    };
}
declare module "block" {
    import { BlockDataType, RowType } from "edgeStore";
    import { AcceptableType } from "fsInternal/types";
    export type BlockAddress = string | null;
    export type BlockType = {
        [key: string | symbol]: AcceptableType;
    };
    export class Block {
        readonly keys: string[];
        private _buffer;
        next: BlockAddress;
        height: number;
        isCommited: boolean;
        constructor(keys: string[], next: BlockAddress, height: number);
        get size(): number;
        private static compareKeys;
        private static assertEqualKeys;
        forEach(callback: (el: BlockType, i: number, arr: BlockType[]) => void): void;
        try_push(data: BlockType): boolean;
        try_pop(): BlockType | null;
        delete(start: number, end?: number): void;
        get isFull(): boolean;
        get isEmpty(): boolean;
        get buffer(): BlockDataType;
        removeAll(): void;
        static deserialize(data: RowType, isCommited?: boolean): Block;
        serialize(): RowType;
    }
}
declare module "contract" {
    import { ContractInfoType } from "solc/compileSol";
    import Web3 from 'web3';
    import { BlockAddress } from "block";
    import { Unit } from "web3-utils";
    import { ChainType } from "edgeStore";
    import BN from "bn.js";
    export const toHex: (value: string | number | BN) => string;
    export const toWei: (val: string | number | BN, unit?: Unit | undefined) => string | BN;
    export const fromWei: (val: string | number | BN, unit?: Unit | undefined) => string;
    export type ContractArgumentType = {
        name: string;
        blockAddress: string;
        rPrice: string | BN;
        rwPrice: string | BN;
    };
    export enum AccessLevel {
        NONE = 0,
        READ = 1,
        RW = 2
    }
    export const SendMethod = "send";
    export const CallMethod = "call";
    type MethodType = 'name' | 'symbol' | 'buy' | 'updatePrices' | 'decimals' | 'minAccessLevel' | 'maxAccessLevel' | 'updatePermission' | 'currentAccessLevel' | 'amountToPayForLevel' | 'getBlockAddress' | 'updateBlockAddress' | 'myAccessLevel' | 'hasNoPerm' | 'hasRPerm' | 'hasRWPerm' | 'getPrices' | 'isOwner';
    type ContractMethodValueType = [MethodType, 'call' | 'send'];
    export const ContractMethod: {
        Name: ContractMethodValueType;
        Symbol: ContractMethodValueType;
        Buy: ContractMethodValueType;
        UpdatePrices: ContractMethodValueType;
        Decimals: ContractMethodValueType;
        MinAccessLevel: ContractMethodValueType;
        MaxAccessLevel: ContractMethodValueType;
        UpdatePermission: ContractMethodValueType;
        CurrentAccessLevel: ContractMethodValueType;
        AmountToPayForLevel: ContractMethodValueType;
        GetBlockAddress: ContractMethodValueType;
        UpdateBlockAddress: ContractMethodValueType;
        MyAccessLevel: ContractMethodValueType;
        HasNoPerm: ContractMethodValueType;
        HasRPerm: ContractMethodValueType;
        HasRWPerm: ContractMethodValueType;
        GetPrices: ContractMethodValueType;
        IsOwner: ContractMethodValueType;
    };
    export default class ShareableStorage {
        static _compiledContract?: ContractInfoType;
        static _web?: Web3;
        static _chainId?: number;
        private _contract;
        private _transcationHash;
        private _address;
        static init(chain: ChainType, compiledContract: ContractInfoType): void;
        get address(): BlockAddress;
        get transcationHash(): BlockAddress;
        constructor(contractAddress?: BlockAddress);
        deploy(account: string, args: ContractArgumentType, gas?: number, gasPrice?: string): Promise<void>;
        private _checkAddress;
        updatePrice(account: string, rPrice: string, rwPrice: string): Promise<void>;
        name(account: string): Promise<string | Error>;
        symbol(account: string): Promise<string | Error>;
        buy(account: string, level: AccessLevel, price: string | BN): Promise<Record<string, unknown> | Error>;
        decimals(account: string): Promise<number | Error>;
        minAccessLevel(account: string): Promise<AccessLevel | Error>;
        maxAccessLevel(account: string): Promise<AccessLevel | Error>;
        getBlockAddress(account: string): Promise<string | Error>;
        currentAccessLevel(account: string, clientAddress?: BlockAddress): Promise<AccessLevel | Error>;
        myAccessLevel(account: string): Promise<AccessLevel | Error>;
        hasNoPerm(account: string): Promise<boolean | Error>;
        hasReadPerm(account: string): Promise<boolean | Error>;
        hasReadWritePerm(account: string): Promise<boolean | Error>;
        isOwner(account: string): Promise<boolean | Error>;
        getPrices(account: string): Promise<string[] | Error>;
        updatePermission(account: string, clientAddress: BlockAddress, level: AccessLevel): Promise<Record<string, unknown> | Error>;
        amountToPayForLevel(account: string, level: AccessLevel): Promise<string | Error>;
        updateBlockAddress(account: string, blockAddress: BlockAddress): Promise<Record<string, unknown> | Error>;
        call(account: string, method: ContractMethodValueType, args?: unknown[], price?: string | BN): Promise<unknown | Error>;
    }
}
declare module "solcConfig" {
    const _default: {
        contracts: {
            path: string;
            cache: string;
        };
    };
    export default _default;
}
declare module "app" { }
declare module "solDriver" { }
declare module "utils" {
    import { ContractInfoType } from "solc/compileSol";
    export const getCompiledContract: (path: string) => Promise<ContractInfoType>;
}
declare module "commands/cd" {
    import { Directory } from "fs";
    export const cd: (path: string | string[], root?: Directory | undefined) => Directory;
    export const cdWithBothFileAndDirAsLastChild: (path: string | string[], root?: Directory | undefined) => Directory | import("fs").File;
}
declare module "commands/ls" {
    import { BlockAddress } from "block";
    import { Directory } from "fs";
    export type FileInfo = {
        isFile: boolean;
        size: number;
        name: string;
        parent: string;
        baseAddress: BlockAddress;
        fullPath: string;
    };
    export const ls: (currNode: Directory, path: string | string[]) => FileInfo[];
}
declare module "commands/utils" {
    export const normalizePath: (path: string | string[]) => string[];
}
