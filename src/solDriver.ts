import SolCompiler from "./solc/compileSol";
import fs from 'fs';
import config from './solcConfig'

const compile = () => {
    const compiler = new SolCompiler(undefined, {
        '*' : {
            'ShareableStorage' : ['abi', 'evm.bytecode']
        }
    });
    const contracts = compiler.compile();
    fs.writeFileSync(config.contracts.cache, JSON.stringify(contracts.ShareableStorage));
}

compile();
