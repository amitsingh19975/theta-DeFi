"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const contractPath = path_1.default.join(__dirname, 'contracts');
const cachePath = path_1.default.join(__dirname, 'compiledContract.json');
exports.default = {
    contracts: {
        path: contractPath,
        cache: cachePath
    }
};
//# sourceMappingURL=solcConfig.js.map