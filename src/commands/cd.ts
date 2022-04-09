import { Directory } from "../fs";
import { ComponentKind, pathToComponents } from "../path";

export const cd = (path: string|string[], root?: Directory) => {
    let base = root || Directory.root;
    const comps = pathToComponents(path);

    for(const el of comps){
        if(el.kind === ComponentKind.RootDir)
            base = Directory.root;
        else if(el.kind === ComponentKind.CurDir)
            continue;
        else if(el.kind === ComponentKind.ParentDir){
            if(base.parent !== null) base = base.parent;
        }else if(el.kind === ComponentKind.Normal) {
            if(!el.text) throw new Error('Internal Parsing error!');
            const child = base.getChild(el.text);
            if(!child)
                throw new Error(`Directory['${base.realName}'] does not have child named '${el.text}'`);
            if(child.isFile())
                throw new Error(`Cannot 'cd' into file['${el.text}']; it only works on directory`);
            const dir = child.asDir();
            if(dir) base = dir;
            else throw Error('[Internal Error] unknown \'FileSystem\' type')
        }else{
            throw new Error(`unknown component found! [${el.kind} : ${el.text||''}]`)
        }
    }

    return base;
}