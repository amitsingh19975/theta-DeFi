"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizePath = void 0;
const normalizePath = (path) => {
    if (Array.isArray(path)) {
        return path.map(el => el.trim());
    }
    else {
        path = path.trim();
        if (path.length === 0)
            return [];
        return path.split('/').map(el => el.trim());
    }
};
exports.normalizePath = normalizePath;
//# sourceMappingURL=utils.js.map