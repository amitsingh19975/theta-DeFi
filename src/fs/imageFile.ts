import { Directory } from "./directory";
import { BlockAddress } from "../block";
import File, { FileKind, FileSerializeType } from "./file";
import { NodeType } from "./fileSystem";

export type ImageSerializeType = {
    height: number,
    width: number
}

export default class ImageFile extends File {
    private _height = 0;
    private _width = 0;
    protected constructor(parent: Directory | null, name: string, protected _initialBlockAddress: BlockAddress, height: number, width: number) {
        super(parent, name, _initialBlockAddress, height * width, FileKind.Image, null);
        this._height = height;
        this._width = width;
    }

    get blockAddress() : BlockAddress { return this._initialBlockAddress; }

    serialize() : FileSerializeType {
        return {
            name: this.name,
            parent: this.parent ? this.parent.name : '',
            type: NodeType.File,
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