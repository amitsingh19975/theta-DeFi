"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const compileSol_1 = __importDefault(require("./solc/compileSol"));
const fs_1 = __importDefault(require("fs"));
const solcConfig_1 = __importDefault(require("./solcConfig"));
const compile = (config) => {
    const compiler = new compileSol_1.default(config, {
        '*': {
            'ShareableStorage': ['abi', 'evm.bytecode']
        }
    });
    const contracts = compiler.compile();
    fs_1.default.writeFileSync(config.contracts.cache, JSON.stringify(contracts.ShareableStorage));
};
compile(solcConfig_1.default);
//# sourceMappingURL=solDriver.js.map