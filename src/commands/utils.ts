export const normalizePath = (path : string | string[]) => {
    if(Array.isArray(path)){
        return path.map(el => el.trim());
    }else{
        path = path.trim();
        if(path.length === 0)
            return [] as string[];
        return path.split('/').map(el => el.trim());
    }
}