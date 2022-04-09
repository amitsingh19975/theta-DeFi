"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.throwOrWarnSolError = void 0;
const chalk_1 = __importDefault(require("chalk"));
const getDecorator = (severity) => {
    switch (severity) {
        case 'error': return chalk_1.default.red.bold;
        case 'info': return chalk_1.default.green.bold;
        case 'warning': return chalk_1.default.yellow.bold;
        default: return chalk_1.default.bold;
    }
};
const formatMessage = (severity, mess) => {
    if (!mess)
        return undefined;
    const decorate = getDecorator(severity);
    let type = '';
    let body = '';
    for (let i = 0; i < mess.length; ++i) {
        const c = mess[i];
        if (c === ':') {
            body = mess.slice(i + 1);
            break;
        }
        else {
            type += c;
        }
    }
    return decorate('Solidity[' + type + ']') + ':' + body;
};
class SolError extends Error {
    constructor(solErrorObj) {
        super(formatMessage('error', solErrorObj.formattedMessage) || solErrorObj.message);
        Error.captureStackTrace(this, SolError);
        this.component = solErrorObj.component;
        this.location = solErrorObj.sourceLocation;
        this.type = solErrorObj.type;
        this.name = '';
    }
}
const throwOrWarnSolError = (solErrorObj) => {
    if (solErrorObj.severity === 'warning')
        console.warn(formatMessage('warning', solErrorObj.formattedMessage) || solErrorObj.message);
    else
        throw new SolError(solErrorObj);
};
exports.throwOrWarnSolError = throwOrWarnSolError;
//# sourceMappingURL=error.js.map