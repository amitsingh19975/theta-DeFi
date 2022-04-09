import { ContractInfoType } from "./solc/compileSol"

export const getCompiledContract = async (path: string) => {
    return await fetch(path) as unknown as ContractInfoType;
}