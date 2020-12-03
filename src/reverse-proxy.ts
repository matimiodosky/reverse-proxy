import {ProxyImpl} from "./impl/reverse-proxy-impl";

export const DEFAULT_PORT = 8080;

export interface CreateOptions {

    host: string
    port?: number
    debug?: boolean
    filteredRequestHeaders?: string[]
    filteredResponseHeaders?: string[]
    ignoreRequestHeaders?: boolean
    ignoreResponseHeaders?: boolean
    maxTransactions?: number
    maxTransactionsPeriodInMillis?: number

}

export interface ReverseProxy {
    init: () => void;
}

export const createProxy: (options: CreateOptions) => ReverseProxy = (options: CreateOptions) => {
    return new ProxyImpl(options)
}
