export function jsonToBase64(jsonObj: any) {
    const jsonString = JSON.stringify(jsonObj)
    return Buffer.from(jsonString).toString('base64')
}

export function base64ToJson(base64String: string) {
    try {
        const jsonString = Buffer.from(base64String, 'base64').toString()
        return JSON.parse(jsonString)
    } catch (error) {
        return base64String
    }
}
