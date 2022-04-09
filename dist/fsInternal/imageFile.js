"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const file_1 = __importStar(require("./file"));
const fileSystem_1 = require("./fileSystem");
class ImageFile extends file_1.default {
    constructor(parent, name, _initialBlockAddress, height, width) {
        super(parent, name, _initialBlockAddress, height * width, file_1.FileKind.Image, null);
        this._initialBlockAddress = _initialBlockAddress;
        this._height = 0;
        this._width = 0;
        this._height = height;
        this._width = width;
    }
    get blockAddress() { return this._initialBlockAddress; }
    serialize() {
        return {
            name: this.name,
            parent: this.parent ? this.parent.name : '',
            type: fileSystem_1.NodeType.File,
            size: this.size,
            kind: this.kind,
            blockAddress: this._initialBlockAddress,
            contractAddress: this._contractAddress,
            serializedChild: {
                height: this._height,
                width: this._width,
            }
        };
    }
}
exports.default = ImageFile;
//# sourceMappingURL=imageFile.js.map