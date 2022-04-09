"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const compileSol_1 = __importDefault(require("./solc/compileSol"));
const fs_1 = __importDefault(require("fs"));
const solcConfig_1 = __importDefault(require("./solcConfig"));
const compile = () => {
    const compiler = new compileSol_1.default(undefined, {
        '*': {
            'ShareableStorage': ['abi', 'evm.bytecode']
        }
    });
    const contracts = compiler.compile();
    fs_1.default.writeFileSync(solcConfig_1.default.contracts.cache, JSON.stringify(contracts.ShareableStorage));
};
compile();
//# sourceMappingURL=solDriver.js.map