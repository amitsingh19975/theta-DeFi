import fs from 'fs';
import Path from 'path';
import config from '../solcConfig';

export { config };

type SolFile = {
    path: string,
    content: string
}

const globSolFilesHelper = (path: string, relPath = '') => {
    const files = fs.readdirSync(path, {withFileTypes: true});
    let res = [] as SolFile[];

    files.forEach(el => {
        const currPath = Path.join(path, el.name);
        const currRelPath = Path.join(relPath,el.name);
        if(el.isDirectory())
            res = [...res, ...globSolFilesHelper(currPath,currRelPath)];
        else
            res.push({
                path: currRelPath,
                content: fs.readFileSync(currPath).toString()
            })
    })

    return res;
}

export const globSolFiles = (path: string) => {
    return globSolFilesHelper(path);
}
