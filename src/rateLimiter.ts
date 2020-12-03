export interface RateLimiter {

    register: () => void
    isAvailable: () => boolean

}
