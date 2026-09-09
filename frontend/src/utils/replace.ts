type ReplaceArgsMap = {
    key: string;
    value: string;
};

export function replaceArgsToString(str: string, ...args: ReplaceArgsMap[]) {
    let result = str;

    for (const arg of args) {
        result = result.replaceAll(arg.key, arg.value);
    }

    return result;
}
