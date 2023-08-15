import axios, { AxiosRequestConfig } from 'axios'
import { entityLogger } from '../logger/logger.service'

const log = entityLogger('AXIOS')

export async function axiosFetch<T>(endpoint: string, accessToken: string): Promise<T> {
    const options = buildAxiosRequestConfig(accessToken)
    log.info(`request made to ${endpoint} at: ` + new Date().toString())

    try {
        const response = await axios.get(endpoint, options)
        return await response.data
    } catch (error) {
        log.error('Axios error: ' + error)
        throw new Error(error as string)
    }
}

export async function axiosPut<T>(endpoint: string, accessToken: string, data: any): Promise<T> {
    const options = buildAxiosRequestConfig(accessToken)
    log.info(`request made to ${endpoint} at: ` + new Date().toString())

    try {
        const response = await axios.put(endpoint, data, options)
        return await response.data
    } catch (error) {
        log.error('Axios error: ' + error)
        throw new Error(error as string)
    }
}

function buildAxiosRequestConfig(accessToken: string): AxiosRequestConfig {
    return {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    }
}
