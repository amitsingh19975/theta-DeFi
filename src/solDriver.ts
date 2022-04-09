import SolCompiler, { userConfiguration } from "./solc/compileSol";
import fs from 'fs';
import config from './solcConfig';

const compile = (config: userConfiguration) => {
    const compiler = new SolCompiler(config, {
        '*' : {
            'ShareableStorage' : ['abi', 'evm.bytecode']
        }
    });
    const contracts = compiler.compile();
    fs.writeFileSync(config.contracts.cache, JSON.stringify(contracts.ShareableStorage));
}

compile(config);
