import solc from 'solc';
import { ErrorObjectType, throwOrWarnSolError } from './error';

import { globSolFiles, config } from './globContracts';

export type userConfiguration = {
    contracts: {
        path: string
    } 
}

export type InSourcesType = { [key: string] : { content?: string, keccak256?: string, urls?: string[] } };

export type OutputSelectionType = {
    [key: string] : {
        [key:string]: string[],
    }
}

// https://docs.soliditylang.org/en/v0.8.13/using-the-compiler.html?highlight=deployedBytecode#output-description
export type SolInputType = {
    language: string,
    sources: InSourcesType,
    settings?: {
        outputSelection: OutputSelectionType
        optimizer?: {
            enabled: boolean,
            runs: number,
            details?: {
                peephole?: boolean,
                inliner?: boolean,
                jumpdestRemover?: boolean,
                orderLiterals?: boolean,
                deduplicate?: boolean,
                cse?: boolean,
                constantOptimizer?: boolean,
                yul?: boolean,
                yulDetails?: {
                    stackAllocation?: boolean,
                    optimizerSteps?: string
                }
            },
        },
        remappings?: string[],
        evmVersion?: "homestead"|"tangerineWhistle"|"spuriousDragon"|"byzantium"|"constantinople",
        metadata?: { 
            useLiteralContent?: boolean,
            bytecodeHash?: "none" | "ipfs" | "bzzr1",
        },
        libraries?: {[key:string] : { [key:string] : string }}
        stopAfter?: string,
        viaIR?: boolean,
        debug?: {
            revertStrings?: "default" | "strip" | "debug" | "verboseDebug",
            debugInfo?: ("location"|"snippet"|"*")[],
        },
        modelChecker?: {
            contracts?: {[key:string] :  string[] },
            divModNoSlacks?: boolean,
            engine?: "all" | "bmc" | "chc" | "none",
            invariants?: ("contract" | "reentrancy")[],
            showUnproved?: boolean,
            solvers?: string[],
            targets?: string[],
            timeout?: number,
        },
    }
}

export type OutSourcesType = {[key: string] : { id: number, ast: {[key:string] : unknown}, legacyAST?: {[key:string] : unknown} }}

export type NatSpecDocumentationType = {version: number} & { [key:string] : unknown }

// User documentation (natspec)
export type UserNatSpecDocumentationType = { kind: "user" } & NatSpecDocumentationType; 

export type DeveloperNatSpecDocumentationType = { kind: "dev" } & NatSpecDocumentationType; 

export type InputsComponentsType = {
    name: string,
    type: string,
    components?: InputsComponentsType,
}[]

export type InputsType = { 
    name: string,
    type: string,
    components?: InputsComponentsType,
    indexed?: boolean
}[]

export type ContractABIType = {
    type: "function" | "constructor" | "receive" | "fallback",
    name?: string,
    inputs: InputsType,
    outputs?: InputsType,
    stateMutability?: "pure" | "view" | "nonpayable" | "payable",
    anonymous?: boolean,
}

export type ContractInfoType = {
    abi: ContractABIType[],
    metadata: string,
    userdoc: UserNatSpecDocumentationType,
    devdoc: DeveloperNatSpecDocumentationType,
    ir: string,
    evm: {
        assembly: string,
        legacyAssembly?: {[key:string|symbol] : unknown}
        bytecode: {
            object: string,
            opcodes: string,
            sourceMap: string,
            linkReferences: {
                [key:string]: { [key:string]: { start: number, length: number}[] }
            },
            generatedSources: {
                ast: {[key:string] : string},
                contents: string,
                id: number,
                language: string,
                name: string,
            }[],
        },
        deployedBytecode: {
            [key:string]: { [key:string]: { start: number, length: number}[] }
        },
        methodIdentifiers: {[key:string] : string},
        gasEstimates: {
            creation: {
                codeDepositCost: string,
                executionCost: string,
                totalCost: string
            },
            external: {[key:string] : string},
            internal: {[key:string] : string}
        },
    },
    ewasm: {
        wast: string,
        wasm: string
    },
    storageLayout?: {
        storage: {
            astId: number,
            contract: string,
            label: string,
            offset: number,
            slot: string,
            type: string
        }[],
        types: {
            [key:string] : {
                encoding: "inplace" | "mapping" | "dynamic_array" | "bytes",
                label: string,
                numberOfBytes: number
            }
        }
    }
}

export type ContractNameType = { [key:string|symbol]: ContractInfoType }
export type OutContractsType = { [key:string]: ContractNameType }

export type SolOutputType = {
    errors?: ErrorObjectType[],
    sources: OutSourcesType,
    contracts: OutContractsType,
}

export default class SolCompiler {

    private _output: SolOutputType = { sources: {}, contracts: {} };
    private _contracts: ContractNameType = {};

    constructor(private readonly _config: userConfiguration = config, private readonly _compilerOutputSelection?: OutputSelectionType, private readonly _runs = 100) {}

    get output() : SolOutputType { return this._output; }

    private _compileHelper() : void {
        const sources = {} as InSourcesType;
        globSolFiles(this._config.contracts.path)
            .forEach(file => sources[file.path] = { content: file.content } );
        
        const outputSelection = {
            '*': {
                '*': ['*']
            }
        } as OutputSelectionType;
        
        const inputDesc = {
            language: 'Solidity',
            sources,
            settings: {
                optimizer: {
                    enabled: true,
                    runs: this._runs,
                },
                outputSelection: this._compilerOutputSelection || outputSelection,
            }
        } as SolInputType;

        this._output = JSON.parse(solc.compile(JSON.stringify(inputDesc)));
        this._checkErrors(this._output.errors || [] as ErrorObjectType[]);
    }

    compile() : ContractNameType {
        this._compileHelper();
        this._setContracts();
        return this.contracts;
    }

    private _setContracts() : void {
        const cts = this._output.contracts;
        for(const k1 in cts){
            for(const k2 in cts[k1])
                this._contracts[k2] = cts[k1][k2];
        }
            
    }

    private _checkErrors(errors: ErrorObjectType[]) : void {
        for(const err of errors){
            throwOrWarnSolError(err);
        }
    }

    get contracts() : ContractNameType {
        return this._contracts;
    }
}
