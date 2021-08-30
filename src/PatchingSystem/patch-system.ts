import {Change, ChangeType, isArray} from "../ChangesSystem/changes-mapper";

export type Patch = {
    revision: number;
    changes: Change[],
}

// changes instead of patch? what does revision mean here?
export function applyPatch<T>(item: T, patch: Patch): T {
    patch.changes.forEach(({path, data, type}) => {
        switch (type) {
            case ChangeType.VALUE_UPDATED:
                deepSet(item, path, data);
                break;
            case ChangeType.VALUE_CREATED:
                deepAdd(item, path, data);
                break;
            case ChangeType.VALUE_DELETED:
                deepDelete(item, path)
                break;
        }
    });
    return item;
}

const deepSet = (obj: any, path: string[], value: any): void => {
    const currentPath = [...path];
    if (currentPath.length > 1) {
        const key = currentPath.shift() as string;
        return deepSet(obj[key], currentPath, value);
    }
    obj[path[0]] = value;
}

const deepDelete = (obj: any, path: string[]): void => {
    const currentPath = [...path];

    if (currentPath.length > 1) {
        const key = currentPath.shift() as string;
        return deepDelete(obj[key], currentPath);
    }
    if (isArray(obj)) {
        obj.splice(currentPath[0], 1);
    } else {
        delete obj[currentPath[0]];
    }
}

const deepAdd = (obj: any, path: string[], value: any): void => {
    const currentPath = [...path];
    if (currentPath.length > 1) {
        const key = currentPath.shift() as string;
        return deepAdd(obj[key], currentPath, value);
    }
    if (isArray(obj)) {
        obj.splice(Number(currentPath[0]), 0, value);
    } else {
        obj[currentPath[0]] = value;
    }
}
//
// const deepGet = (obj: any, path: string[]): any => {
//     const currentPath = [...path];
//     if (currentPath.length > 1) {
//         const key = currentPath.shift() as string;
//         return deepGet(obj[key], currentPath);
//     }
//     return obj[currentPath[0]];
// }
