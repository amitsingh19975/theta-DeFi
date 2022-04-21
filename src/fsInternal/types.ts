enum Type{
    Int,
    Float,
    String,
    Boolean
}

export type BasicAcceptableType = number | string | boolean | null;
export type AcceptableType = BasicAcceptableType | AcceptableType[];

const getCorrectType = (val: BasicAcceptableType) => {
    switch(typeof val){
    case 'string': return 'String';
    case 'boolean': return 'Boolean';
    case 'number': return Number.isInteger(val) ? 'Int' : 'Float';
    default: return val ? 'unknown type' : 'null';
    }
}

export class BasicType{
    private readonly _canBeNull: boolean[];
    readonly _arrayDepth: number;
    constructor(private readonly _type: Type, canBeNull?: boolean[] | boolean, arrayDepth?: number){
        this._arrayDepth = arrayDepth || 0;

        if (Array.isArray(canBeNull)){
            this._canBeNull = canBeNull;
        }else{
            const fillVal: boolean = (typeof canBeNull === 'boolean' ? canBeNull : true);
            this._canBeNull = new Array<boolean>(this._arrayDepth + 1).fill(fillVal);
        }
    }

    get isInt() : boolean { return this._type === Type.Int; }
    get isFloat() : boolean { return this._type === Type.Float; }
    get isStr() : boolean { return this._type === Type.String; }
    get isBool() : boolean { return this._type === Type.Boolean; }

    static make(obj: Record<string, unknown>): BasicType {
        return new BasicType(obj._type as Type, obj._canBeNull as boolean[], obj._arrayDepth as number);
    }

    private typeToGraphQLType() : string {
        switch(this._type) {
        case Type.Int: return 'Int';
        case Type.Float: return 'Float';
        case Type.String: return 'String';
        case Type.Boolean: return 'Boolean';
        default: throw new Error('[Type] unknown type');
        }
    }

    private toStringHelper(depth: number) : string {
        const temp = this.canBeNull(depth) ? '' : '!';
        if(depth === 0)
            return this.typeToGraphQLType() + temp;
        // console.log(depth);
        return '[' + this.toStringHelper(depth - 1) + ']' + temp;
    }

    toStr() : string {
        return this.toStringHelper(this._arrayDepth);
    }
    
    canBeNull(depth? : number) : boolean { return this._canBeNull[depth || 0]; }

    private checkConstraintsHelper(val: BasicAcceptableType) : [boolean,string] {
        const vtype = typeof val;

        switch(this._type){
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

    private checkConstraintsArray(val: AcceptableType, depth: number) : [boolean, string]{
        // console.log(this._canBeNull, depth);
        if(val === null || typeof val === 'undefined'){
            return [this.canBeNull(depth), `expected value to be non-null "${this.typeToGraphQLType()}", but found null`];
        }

        if(depth === 0){
            if(Array.isArray(val))
                return [false, `mismatched type; expected type to be ${this.toString()}`];
            return this.checkConstraintsHelper(val);
        }
        if(!Array.isArray(val))
            return [false, `mismatched type; expected type to be ${this.toString()}`];

        return this.checkConstraintsArray(val[0], depth - 1);
    }

    checkConstraints(val: AcceptableType) : [boolean, string] {
        if(val === null || typeof val === 'undefined'){
            return [this.canBeNull(0),`expected value to be non-null "${this.typeToGraphQLType()}", but found null`];
        }
        
        if(Array.isArray(val))
            return this.checkConstraintsArray(val, this._arrayDepth);
        
        return this.checkConstraintsHelper(val as BasicAcceptableType);

    }

    private _checkNumber(data: number): number {
        if(Number.isInteger(data)) {
            if(this.isInt || this.isFloat) return data;
            throw new Error(`[Invalid Type] expected "${this.toStr()}", but found "${getCorrectType(data)}"`);
        }
        if(this.isInt) throw new Error(`[Invalid Type] expected "Int", but got "Float"[${data}]`);
        return data;
    }

    private _parseNumber(data: string): number {
        const num = Number.parseInt(data);
        if(this.isInt) {
            if(Number.isInteger(num)) return num;
            throw new Error(`unable to parse string[${data}] in "Int"`);
        }
        const float = Number.parseFloat(data);
        if(this.isFloat && !Number.isNaN(float)) return float;
        throw new Error(`unable to parse string[${data}] in "Float" because we found NaN, while parsing`);
    }

    private _parseBool(data: string): boolean {
        const temp = data.toLowerCase();
        switch(temp){
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

    parseType(data: unknown) : BasicAcceptableType {
        if (data === null || data === undefined) {
            if (!this.canBeNull()) throw new Error('[Invalid Type] type cannot be null');
        }
        if(typeof data !== 'string') {
            const temp = data as (number|boolean);
            if(this.isStr) return temp.toString();
            if(typeof data === 'number') return this._checkNumber(data);
            if(typeof data === 'boolean' && this.isBool) return data;
            if(!this.checkConstraints(temp)) throw new Error(`[Invalid Type] expected "${this.toStr()}", but found "${getCorrectType(temp)}[${data}]"`);
        }else {
            if(this.isStr) return data;
            if(this.isBool) return this._parseBool(data);
            if(this.isInt||this.isFloat) return this._parseNumber(data);
            throw new Error('unknown type found[${data}] (right now, we are only able to parse basic types, such as Number, String, and Boolean)');
        }
        return data as BasicAcceptableType;
    }

}

export function Int(canBeNullDepth?: boolean[] | boolean, arrayDepth?: number): BasicType{
    return new BasicType(Type.Int, canBeNullDepth, arrayDepth);
}

export function Str(canBeNullDepth?: boolean[] | boolean, arrayDepth?: number): BasicType{
    return new BasicType(Type.String, canBeNullDepth, arrayDepth);
}

export function Bool(canBeNullDepth?: boolean[] | boolean, arrayDepth?: number): BasicType{
    return new BasicType(Type.Boolean, canBeNullDepth, arrayDepth);
}

export function Float(canBeNullDepth?: boolean[] | boolean, arrayDepth?: number): BasicType{
    return new BasicType(Type.Float, canBeNullDepth, arrayDepth);
}