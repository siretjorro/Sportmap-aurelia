import { ILogLevel } from "types/ILogLevel";

export function queryStringValue(variableName: string): string | undefined {
    return location.search
        .substring(1)
        .split("&")
        .map((p) => p.split("="))
        .filter((p) => p[0] == variableName)
        .map((p) => decodeURIComponent(p[1]))
        .pop();
}

export function uuidv4(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export function validateLogLevel(logLevel: string | undefined): string {
    switch (logLevel) {
        case ILogLevel.debug:
            return ILogLevel.debug;
        case ILogLevel.info:
            return ILogLevel.info;
        case ILogLevel.warn:
            return ILogLevel.warn;
        case ILogLevel.error:
            return ILogLevel.error;
        case ILogLevel.none:
        default:
            return ILogLevel.none;
    }
}

