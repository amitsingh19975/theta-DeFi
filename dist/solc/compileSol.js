"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const solc_1 = __importDefault(require("solc"));
const error_1 = require("./error");
const globContracts_1 = require("./globContracts");
class SolCompiler {
    constructor(_config, _compilerOutputSelection, _runs = 100) {
        this._config = _config;
        this._compilerOutputSelection = _compilerOutputSelection;
        this._runs = _runs;
        this._output = { sources: {}, contracts: {} };
        this._contracts = {};
    }
    get output() { return this._output; }
    _compileHelper() {
        const sources = {};
        (0, globContracts_1.globSolFiles)(this._config.contracts.path)
            .forEach(file => sources[file.path] = { content: file.content });
        const outputSelection = {
            '*': {
                '*': ['*']
            }
        };
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
        };
        this._output = JSON.parse(solc_1.default.compile(JSON.stringify(inputDesc)));
        this._checkErrors(this._output.errors || []);
    }
    compile() {
        this._compileHelper();
        this._setContracts();
        return this.contracts;
    }
    _setContracts() {
        const cts = this._output.contracts;
        for (const k1 in cts) {
            for (const k2 in cts[k1])
                this._contracts[k2] = cts[k1][k2];
        }
    }
    _checkErrors(errors) {
        for (const err of errors) {
            (0, error_1.throwOrWarnSolError)(err);
        }
    }
    get contracts() {
        return this._contracts;
    }
}
exports.default = SolCompiler;
//# sourceMappingURL=compileSol.js.map