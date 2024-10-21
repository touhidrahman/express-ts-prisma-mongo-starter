export function getTakeAndSkip(
    page: string | number | null | undefined,
    size: string | number | null | undefined,
): { take: number | undefined; skip: number | undefined } {
    let nPage = parseInt(page as string)
    let nSize = parseInt(size as string)
    if (!nPage && !nSize) return { take: undefined, skip: undefined }

    if (nPage < 0) nPage = 0
    if (nSize < 1) nSize = 1

    return {
        take: nSize,
        skip: (nPage - 1) * nSize,
    }
}
