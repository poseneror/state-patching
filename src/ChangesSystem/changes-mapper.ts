export enum ChangeType {
    VALUE_CREATED = 'VALUE_CREATED',
    VALUE_UPDATED = 'VALUE_UPDATED',
    VALUE_DELETED = 'VALUE_DELETED',
    VALUE_UNCHANGED = 'VALUE_UNCHANGED',
}

export type Change = {
    type: ChangeType,
    data: any,
    path: string[],
}

let currentRevision = 0;

export const createPatch = (obj1: any, obj2: any) => {
    return {
        revision: currentRevision++,
        changes: mapChanges(obj1, obj2).filter(change => change.type !== ChangeType.VALUE_UNCHANGED),
    }
}

export function mapChanges(originalValue: any, newValue: any, path: string[] = []): Change[] {
    const changes: Change[] = [];
    if (isFunction(originalValue) || isFunction(newValue)) {
        throw 'Invalid argument. Function given, object expected.';
    }
    if (isValue(originalValue) || isValue(newValue)) {
        const diffType = compareValues(originalValue, newValue);
        changes.push({
            type: diffType,
            data: diffType === ChangeType.VALUE_DELETED ? originalValue : newValue,
            path,
        });
    } else {
        Object.keys(originalValue).forEach((key) => {
            if (isFunction(originalValue[key])) {
                return;
            }
            changes.push(...mapChanges(originalValue[key], newValue[key], [...path, key]));
        })
        Object.keys(newValue).forEach((key) => {
            if (isFunction(newValue[key]) || changes.find((diff) => isPathContained([...path, key], diff.path))) {
                return;
            }
            changes.push(...mapChanges(undefined, newValue[key], [...path, key]))
        });
    }
    return changes;
}

const compareValues = (originalValue: any, newValue: any) => {
    if (originalValue === newValue) {
        return ChangeType.VALUE_UNCHANGED;
    }
    if (isDate(originalValue) && isDate(newValue) && originalValue.getTime() === newValue.getTime()) {
        return ChangeType.VALUE_UNCHANGED;
    }
    if (originalValue === undefined) {
        return ChangeType.VALUE_CREATED;
    }
    if (newValue === undefined) {
        return ChangeType.VALUE_DELETED;
    }
    return ChangeType.VALUE_UPDATED;
}

const isPathContained = (p1: string[], p2: string[]) => {
    return p1.every((pathKey, index) => {
        return pathKey === p2?.[index]
    })
}

const isFunction = (x: any) => {
    return Object.prototype.toString.call(x) === '[object Function]';
}

export const isArray = (x: any) => {
    return Object.prototype.toString.call(x) === '[object Array]';
}

const isDate = (x: any) => {
    return Object.prototype.toString.call(x) === '[object Date]';
}

const isObject = (x: any) => {
    return Object.prototype.toString.call(x) === '[object Object]';
}

const isValue = (x: any) => {
    return !isObject(x) && !isArray(x);
}
