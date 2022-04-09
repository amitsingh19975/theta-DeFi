import path from 'path';

const contractPath = path.join(__dirname, 'contracts');
const cachePath = path.join(__dirname, 'compiledContract.json');

export default {
    contracts: {
        path: contractPath,
        cache: cachePath
    }
}