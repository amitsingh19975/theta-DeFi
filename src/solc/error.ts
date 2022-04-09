import chalk from 'chalk';

type ErrorType = 
  'TypeError'
| 'JSONError'
| 'IOError'
| 'ParserError'
| 'DocstringParsingError'
| 'SyntaxError'
| 'DeclarationError'
| 'UnimplementedFeatureError'
| 'InternalCompilerError'
| 'Exception'
| 'CompilerError'
| 'FatalError'
| 'Warning'
| 'DocstringParsingError'

type SeverityType = 'error' | 'warning' | 'info';

export type SourceLocationType = {
    file: string,
    start: number,
    end: number
}

export type ErrorObjectType = {
    sourceLocation?: SourceLocationType,
    secondarySourceLocations?: (SourceLocationType & {message: string})[]
    type: ErrorType,
    component: string,
    severity: SeverityType,
    message: string,
    formattedMessage?: string,
    errorCode?: number,
}

const getDecorator = (severity: SeverityType) => {
    switch(severity){
    case 'error': return chalk.red.bold;
    case 'info': return chalk.green.bold;
    case 'warning': return chalk.yellow.bold;
    default: return chalk.bold;
    }
}

const formatMessage = (severity: SeverityType, mess?: string) => {
    if(!mess) return undefined;
    const decorate = getDecorator(severity);

    let type = '';
    let body = '';
    for(let i = 0; i < mess.length; ++i){
        const c = mess[i];
        if(c === ':'){
            body = mess.slice(i + 1);
            break;
        }else{
            type += c;
        }
    }

    return decorate('Solidity[' + type + ']') + ':' + body;
}

class SolError extends Error {
    component: string;
    location?: SourceLocationType;
    type: ErrorType;
    constructor(solErrorObj: ErrorObjectType) {
        super(formatMessage('error', solErrorObj.formattedMessage) || solErrorObj.message);
        Error.captureStackTrace(this, SolError);
        this.component = solErrorObj.component;
        this.location = solErrorObj.sourceLocation;
        this.type = solErrorObj.type;
        this.name = '';
    }
}

export const throwOrWarnSolError = (solErrorObj: ErrorObjectType) => {
    if(solErrorObj.severity === 'warning')
        console.warn(formatMessage('warning', solErrorObj.formattedMessage) || solErrorObj.message);
    else
        throw new SolError(solErrorObj);
}
