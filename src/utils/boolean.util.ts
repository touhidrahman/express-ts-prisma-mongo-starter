export function parseBool(value: boolean | 'true' | 'false' | 'Yes' | 'No' | 'Y' | 'N' | '1' | '0' | 1 | 0): boolean {
    if (typeof value === 'boolean') return value
    if (value === 1) return true
    if (value === 0) return false
    return ['true', 'yes', 'y', '1'].includes((value as string).toLowerCase())
        ? true
        : ['false', 'no', 'n', '0'].includes((value as string).toLowerCase())
        ? false
        : false
}
