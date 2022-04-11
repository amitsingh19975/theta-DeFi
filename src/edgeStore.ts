import axios from "axios";
import { Block, BlockAddress, BlockType } from "./block";
import ThetaConfig from './config.json'
import { TableMetadataType } from "./fsInternal/tableFile";

export const MAX_BLOCK_SIZE = 1024;

export type EdgeStoreConfigType = {
    protocol?: string,
    domain?: string,
    port?: number
    market?: {
        domain?: string,
        port?: number
    }
}

export const EdgeStoreConfig = {
    protocol: ( 'protocol' in ThetaConfig ? ThetaConfig.protocol : 'https://' ),
    domain: ('domain' in ThetaConfig ? ThetaConfig.domain : 'localhost'),
    port: ('port' in ThetaConfig ? ThetaConfig.port : null),
    market: {
        domain: ('market' in ThetaConfig && 'domain' in ThetaConfig.market ? ThetaConfig.market.domain : 'localhost'),
        port: ('market' in ThetaConfig && 'port' in ThetaConfig.market ? ThetaConfig.market.port : 8080)
    }
}

export const initializeEdgeStore = (config?: EdgeStoreConfigType) => {
    EdgeStoreConfig.domain = config?.domain || EdgeStoreConfig.domain;
    EdgeStoreConfig.port = config?.port || EdgeStoreConfig.port;
    EdgeStoreConfig.protocol = config?.protocol || EdgeStoreConfig.protocol;
    EdgeStoreConfig.market = {
        domain: config?.market?.domain || EdgeStoreConfig.market.domain,
        port: config?.market?.port || EdgeStoreConfig.market.port
    };
    return EdgeStoreConfig;
}

type URLArgsType = {
    protocol: string,
    domain: string,
    port?: number,
    suffix?: string
};

export const makeURLFromArgs = ({protocol, domain, port, suffix}: URLArgsType) => {
    return protocol + domain + ( port ? ':' + port : '' ) + (suffix || '');
};

export const makeEdgeStoreURL = () => {
    return makeURLFromArgs({
        suffix: '/rpc',
        protocol: EdgeStoreConfig.protocol,
        domain: EdgeStoreConfig.domain,
        port: EdgeStoreConfig.port || undefined
    });
}

export const makeMarketURL = () => {
    return makeURLFromArgs({
        protocol: EdgeStoreConfig.protocol,
        domain: EdgeStoreConfig.market.domain,
        port: EdgeStoreConfig.market.port || undefined
    });
}

export const URLS = {
    edgeStoreURL: makeEdgeStoreURL(),
    marketURL: makeMarketURL(),
};

enum EdgeStoreMethod{
    GetVersion  = 'edgestore.GetVersion',
    GetStatus   = 'edgestore.GetStatus',
    GetPeers    = 'edgestore.GetPeers',
    PutData     = 'edgestore.PutData',
    GetData     = 'edgestore.GetData',
    PutFile     = 'edgestore.PutFile',
    GetFile     = 'edgestore.GetFile',
}

type EdgeResponeBaseType = {
    jsonrpc: string,
    id: string|number|boolean|null|undefined,
}

export type GetVersionType = EdgeResponeBaseType & {
    result: {
        version: string,
        git_hash: string,
        timestamp: string
    }
}

export type GetStatusType = EdgeResponeBaseType & {
    result: {
        id: string,
        current_time: string,
    }
}

export type GetPeersType = EdgeResponeBaseType & {
    result: {
        peers: string[],
    }
}

export type PutDataType = EdgeResponeBaseType & {
    result: {
        key: string,
        success: boolean,
    }
}

export type GetDataType = EdgeResponeBaseType & {
    result: {
        val: string
    }
}

export type PutFileType = EdgeResponeBaseType & {
    result: {
        key: string,
        relpath: string,
        success: boolean,
    }
}

export type GetFileType = EdgeResponeBaseType & {
    result: {
        path: string
    }
}

export type ErrorType = EdgeResponeBaseType & {
    error: {
        code: number,
        message: string
    }
}

export type EdgeResponeType = GetVersionType|GetStatusType|GetPeersType|PutDataType|GetDataType|PutFileType|GetFileType|ErrorType;

// { data: {name:[] , type:[] , ...}}, size:}

export type BlockDataType = BlockType[];
export type RowType = { data: BlockDataType, size: number, next: BlockAddress, height: number };
export type StorageType = { [key: symbol] : RowType | string };

export const validateRow = (row: BlockDataType) => {
    return ('data' in row) && ('next' in row) && ('size' in row) && ('id' in row);
}

export const validateAddress = (row: BlockDataType) => {
    return ('addresses' in row) && ('next' in row) && ('id' in row);
}

const prepareDataBlock = (val: StorageType) => {
    if(Object.keys(val).length === 0)
        return [];
    else
        return [{val: JSON.stringify(val)}];
}

const prepareDataHelper = (params: StorageType) => {
    if(Object.keys(params).length === 0)
        return [];
    else
        return [params];
}

const prepareData = (method: string, id: number | string, payload: StorageType | Block ) => {
    const params = (payload instanceof Block) ? prepareDataBlock(payload.serialize()) : prepareDataHelper(payload);
    return {
        jsonrpc: ( 'jsonrpc' in ThetaConfig ? ThetaConfig['jsonrpc'] : '2.0' ),
        method,
        id,
        params
    }
}


const postToEdgeStore = async (method: EdgeStoreMethod, id: number | string, params?: StorageType | Block ) => {
    const payload = prepareData(method, id, params || {});
    return axios.post(URLS.edgeStoreURL, payload);
}

export const getVersion = async (id: number | string, params?: StorageType | Block ) => postToEdgeStore(EdgeStoreMethod.GetVersion, id, params);
export const getStatus  = async (id: number | string, params?: StorageType | Block ) => postToEdgeStore(EdgeStoreMethod.GetStatus, id, params);
export const getPeers   = async (id: number | string, params?: StorageType | Block ) => postToEdgeStore(EdgeStoreMethod.GetPeers, id, params);
export const putData    = async (id: number | string, params?: StorageType | Block ) => postToEdgeStore(EdgeStoreMethod.PutData, id, params);
export const getData    = async (id: number | string, params?: StorageType | Block ) => postToEdgeStore(EdgeStoreMethod.GetData, id, params);
export const putFile    = async (id: number | string, params?: StorageType | Block ) => postToEdgeStore(EdgeStoreMethod.PutFile, id, params);
export const getFile    = async (id: number | string, params?: StorageType | Block ) => postToEdgeStore(EdgeStoreMethod.GetFile, id, params);

export enum MarketMethod {
    AddTable = 'Market.AddTable',
    AddImage = 'Market.AddImage',
}

export type BasicMarketPayloadType = {
    userName: string,
    readPrice: {
        amount: string,
        unit: string
    },
    readWritePrice: {
        amount: string,
        unit: string
    }
    description: string,
}

export type MarketAddTablePayloadType = BasicMarketPayloadType & {
    contractAddress: BlockAddress,
    tableInfo: TableMetadataType,
}

export const market = async (method: MarketMethod, payload: MarketAddTablePayloadType) => {
    return await axios.post(URLS.marketURL, payload);
}
