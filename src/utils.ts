import { ContractInfoType } from "./solc/compileSol"

export const getCompiledContract = async (path: string) => {
    return await import(path) as ContractInfoType;
}