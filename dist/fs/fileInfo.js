"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileInfo = exports.defaultFilterFn = exports.defaultMapFn = exports.Bool = exports.Str = exports.Float = exports.Int = void 0;
const types_1 = require("./types");
Object.defineProperty(exports, "Int", { enumerable: true, get: function () { return types_1.Int; } });
Object.defineProperty(exports, "Float", { enumerable: true, get: function () { return types_1.Float; } });
Object.defineProperty(exports, "Str", { enumerable: true, get: function () { return types_1.Str; } });
Object.defineProperty(exports, "Bool", { enumerable: true, get: function () { return types_1.Bool; } });
const graphql_1 = require("graphql");
const checkIfMoreThanOneDefination = (node) => {
    let count = 0;
    for (const el of node) {
        if (el.kind === graphql_1.Kind.OBJECT_TYPE_DEFINITION)
            ++count;
    }
    return count === 1;
};
const getDefinationNode = (node) => {
    for (const el of node.definitions) {
        if (el.kind === graphql_1.Kind.OBJECT_TYPE_DEFINITION)
            return el;
    }
    return null;
};
const defaultMapFn = (data) => {
    if (Array.isArray(data)) {
        return data.map(exports.defaultMapFn);
    }
    else if (typeof data === 'string') {
        return data.trim();
    }
    else if (typeof data === 'boolean') {
        return data ? true : false;
    }
    else {
        return data;
    }
};
exports.defaultMapFn = defaultMapFn;
const defaultFilterFn = () => true;
exports.defaultFilterFn = defaultFilterFn;
const constructInternalFieldType = (f) => {
    var _a;
    return {
        name: f.name.trim(),
        type: f.type,
        description: ((_a = f.description) === null || _a === void 0 ? void 0 : _a.trim()) || '',
        map: f.map || exports.defaultMapFn,
        filter: f.filter || exports.defaultFilterFn
    };
};
class FileInfo {
    constructor(tableName, source, description, fields) {
        this.tableName = tableName;
        this.fields = [];
        fields && fields.forEach(el => this.fields.push(constructInternalFieldType(el)));
        this.description = (description === null || description === void 0 ? void 0 : description.trim()) || '';
        this.source = source || '';
    }
    getField(name) {
        name = name.trim();
        const f = this.fields.find(el => el.name === name);
        return f ? f : null;
    }
    addField(field) {
        if (this.getField(field.name))
            return false;
        this.fields.push(constructInternalFieldType(field));
        return true;
    }
    get keys() {
        return this.fields.map(el => el.name).sort();
    }
    forEach(callback) {
        this.fields.forEach(callback);
    }
    validateType(name, data, callback) {
        const f = this.getField(name);
        if (!f) {
            callback(false, data);
        }
        else {
            const mdata = f.map(data);
            if (f.filter(mdata))
                callback(f.type.checkConstraints(mdata), mdata);
        }
    }
    buildRow(args) {
        const result = {};
        this.fields.forEach(f => {
            const name = f.name;
            if (name in args) {
                const el = args[name];
                const mdata = f.map(el);
                if (f.filter(mdata)) {
                    if (!f.type.checkConstraints(mdata))
                        throw new Error(`[${name} : ${f.type.toString()}] => type constraints are not satisfied!`);
                    else
                        result[name] = mdata;
                }
            }
            else {
                if (f.type.canBeNull()) {
                    result[name] = null;
                }
                else {
                    throw new Error(`[${name} : ${f.type.toString()}] => Field cannot be skipped or null`);
                }
            }
        });
        return result;
    }
    updateMapFn(name, map) {
        const f = this.getField(name);
        if (!f)
            return false;
        f.map = map;
        return true;
    }
    updateFilterFn(name, filter) {
        const f = this.getField(name);
        if (!f)
            return false;
        f.filter = filter;
        return true;
    }
    removeFieldData(index) {
        // TODO: Remove the field data;
    }
    removeAll() {
        this.fields.forEach((_, idx) => this.removeFieldData(idx));
    }
    removeField(name) {
        let idx = -1;
        this.fields.find((el, i) => idx = (el.name === name ? i : -1));
        if (idx < 0)
            return false;
        this.removeFieldData(idx);
        this.fields = this.fields.splice(idx, 1);
        return true;
    }
    static fromGraphQLSource(source) {
        try {
            const fields = [];
            let name = '';
            let description;
            const ast = (0, graphql_1.parse)(source);
            const definitionNode = getDefinationNode(ast);
            if (!checkIfMoreThanOneDefination(ast.definitions)) {
                throw new Error('There can be only one Object Definition; no less, no more!');
            }
            if (definitionNode === null)
                throw new Error('No defination node found');
            (0, graphql_1.visit)(definitionNode, {
                ObjectTypeDefinition(node) {
                    var _a;
                    name = node.name.value;
                    description = (_a = node.description) === null || _a === void 0 ? void 0 : _a.value;
                },
                FieldDefinition(node) {
                    var _a;
                    const f = {
                        name: node.name.value,
                        type: mapType(node.type),
                        description: (_a = node.description) === null || _a === void 0 ? void 0 : _a.value
                    };
                    fields.push(f);
                }
            });
            return new FileInfo(name, source, description, fields);
        }
        catch (e) {
            throw new Error(`[Error while parsing GraphQL] => ${e}`);
        }
    }
    serialize() {
        return {
            fields: this.fields,
            source: this.source,
            description: this.description,
        };
    }
    static deserialize(json) {
        return new FileInfo(json.tableName, json.source, json.description, json.fields);
    }
}
exports.FileInfo = FileInfo;
const matchType = (node, value) => node.value === value;
const mapTypeHelper = (type, arrD, canBeNull) => {
    const makeType = (t) => t(canBeNull.reverse(), arrD);
    if (matchType(type.name, graphql_1.TokenKind.FLOAT))
        return makeType(types_1.Float);
    else if (matchType(type.name, graphql_1.TokenKind.INT))
        return makeType(types_1.Int);
    else if (matchType(type.name, graphql_1.TokenKind.STRING))
        return makeType(types_1.Str);
    else if (matchType(type.name, 'Boolean'))
        return makeType(types_1.Bool);
    else
        throw new Error('Unsupported Type!');
};
const mapType = (type, arrD = 0, canBeNull = [], shouldPush = true) => {
    const isNonNull = type.kind === graphql_1.Kind.NON_NULL_TYPE;
    if (shouldPush) {
        canBeNull.push(!isNonNull);
    }
    if (type.kind === graphql_1.Kind.NAMED_TYPE) {
        return mapTypeHelper(type, arrD, canBeNull);
    }
    else if (type.kind === graphql_1.Kind.LIST_TYPE) {
        return mapType(type.type, arrD + 1, canBeNull);
    }
    else if (type.kind === graphql_1.Kind.NON_NULL_TYPE) {
        return mapType(type.type, arrD, canBeNull, false);
    }
};
//# sourceMappingURL=fileInfo.js.map