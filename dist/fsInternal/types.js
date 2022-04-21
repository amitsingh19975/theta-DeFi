"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Float = exports.Bool = exports.Str = exports.Int = exports.BasicType = void 0;
var Type;
(function (Type) {
    Type[Type["Int"] = 0] = "Int";
    Type[Type["Float"] = 1] = "Float";
    Type[Type["String"] = 2] = "String";
    Type[Type["Boolean"] = 3] = "Boolean";
})(Type || (Type = {}));
const getCorrectType = (val) => {
    switch (typeof val) {
        case 'string': return 'String';
        case 'boolean': return 'Boolean';
        case 'number': return Number.isInteger(val) ? 'Int' : 'Float';
        default: return val ? 'unknown type' : 'null';
    }
};
class BasicType {
    constructor(_type, canBeNull, arrayDepth) {
        this._type = _type;
        this._arrayDepth = arrayDepth || 0;
        if (Array.isArray(canBeNull)) {
            this._canBeNull = canBeNull;
        }
        else {
            const fillVal = (typeof canBeNull === 'boolean' ? canBeNull : true);
            this._canBeNull = new Array(this._arrayDepth + 1).fill(fillVal);
        }
    }
    get isInt() { return this._type === Type.Int; }
    get isFloat() { return this._type === Type.Float; }
    get isStr() { return this._type === Type.String; }
    get isBool() { return this._type === Type.Boolean; }
    static make(obj) {
        return new BasicType(obj._type, obj._canBeNull, obj._arrayDepth);
    }
    typeToGraphQLType() {
        switch (this._type) {
            case Type.Int: return 'Int';
            case Type.Float: return 'Float';
            case Type.String: return 'String';
            case Type.Boolean: return 'Boolean';
            default: throw new Error('[Type] unknown type');
        }
    }
    toStringHelper(depth) {
        const temp = this.canBeNull(depth) ? '' : '!';
        if (depth === 0)
            return this.typeToGraphQLType() + temp;
        // console.log(depth);
        return '[' + this.toStringHelper(depth - 1) + ']' + temp;
    }
    toStr() {
        return this.toStringHelper(this._arrayDepth);
    }
    canBeNull(depth) { return this._canBeNull[depth || 0]; }
    checkConstraintsHelper(val) {
        const vtype = typeof val;
        switch (this._type) {
            case Type.Int:
                return [Number.isInteger(val), `expected "Int", but found "${getCorrectType(val)}"`];
            case Type.Float:
                return [vtype === 'number', `expected "Float", but found "${getCorrectType(val)}"`];
            case Type.Boolean:
                return [vtype === 'boolean', `expected "Boolean", but found "${getCorrectType(val)}"`];
            case Type.String:
                return [vtype === 'string', `expected "String", but found "${getCorrectType(val)}"`];
            default:
                return [false, 'unsupported type'];
        }
    }
    checkConstraintsArray(val, depth) {
        // console.log(this._canBeNull, depth);
        if (val === null || typeof val === 'undefined') {
            return [this.canBeNull(depth), `expected value to be non-null "${this.typeToGraphQLType()}", but found null`];
        }
        if (depth === 0) {
            if (Array.isArray(val))
                return [false, `mismatched type; expected type to be ${this.toString()}`];
            return this.checkConstraintsHelper(val);
        }
        if (!Array.isArray(val))
            return [false, `mismatched type; expected type to be ${this.toString()}`];
        return this.checkConstraintsArray(val[0], depth - 1);
    }
    checkConstraints(val) {
        if (val === null || typeof val === 'undefined') {
            return [this.canBeNull(0), `expected value to be non-null "${this.typeToGraphQLType()}", but found null`];
        }
        if (Array.isArray(val))
            return this.checkConstraintsArray(val, this._arrayDepth);
        return this.checkConstraintsHelper(val);
    }
    _checkNumber(data) {
        if (Number.isInteger(data)) {
            if (this.isInt || this.isFloat)
                return data;
            throw new Error(`[Invalid Type] expected "${this.toStr()}", but found "${getCorrectType(data)}"`);
        }
        if (this.isInt)
            throw new Error(`[Invalid Type] expected "Int", but got "Float"`);
        return data;
    }
    _parseNumber(data) {
        const num = Number.parseInt(data);
        if (this.isInt) {
            if (Number.isInteger(num))
                return num;
            throw new Error('unable to parse string in "Int"');
        }
        const float = Number.parseFloat(data);
        if (this.isFloat && !Number.isNaN(float))
            return float;
        throw new Error('unable to parse string in "Float" because we found NaN, while parsing');
    }
    _parseBool(data) {
        const temp = data.toLowerCase();
        switch (temp) {
            case 'true':
            case 't':
            case '1':
            case 'yes':
            case 'y':
                return true;
            case 'false':
            case 'f':
            case '0':
            case 'n':
            case 'no':
                return false;
        }
        throw new Error(`unable to parse ["${data}"] into bool`);
    }
    parseType(data) {
        if (data === null || data === undefined) {
            if (!this.canBeNull())
                throw new Error('[Invalid Type] type cannot be null');
        }
        if (typeof data !== 'string') {
            const temp = data;
            if (this.isStr)
                return temp.toString();
            if (typeof data === 'number')
                return this._checkNumber(data);
            if (typeof data === 'boolean' && this.isBool)
                return data;
            if (!this.checkConstraints(temp))
                throw new Error(`[Invalid Type] expected "${this.toStr()}", but found "${getCorrectType(temp)}"`);
        }
        else {
            if (this.isStr)
                return data;
            if (this.isBool)
                return this._parseBool(data);
            if (this.isInt || this.isFloat)
                return this._parseNumber(data);
            throw new Error('unknown type found (right now, we are only able to parse basic types, such as Number, String, and Boolean)');
        }
        return data;
    }
}
exports.BasicType = BasicType;
function Int(canBeNullDepth, arrayDepth) {
    return new BasicType(Type.Int, canBeNullDepth, arrayDepth);
}
exports.Int = Int;
function Str(canBeNullDepth, arrayDepth) {
    return new BasicType(Type.String, canBeNullDepth, arrayDepth);
}
exports.Str = Str;
function Bool(canBeNullDepth, arrayDepth) {
    return new BasicType(Type.Boolean, canBeNullDepth, arrayDepth);
}
exports.Bool = Bool;
function Float(canBeNullDepth, arrayDepth) {
    return new BasicType(Type.Float, canBeNullDepth, arrayDepth);
}
exports.Float = Float;
//# sourceMappingURL=types.js.map