import { ContractInfoType } from "./solc/compileSol"

const getCompiledContract = async (path: string) => {
    return await import(path) as ContractInfoType;
}