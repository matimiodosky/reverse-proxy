import {RateLimiter} from "../rateLimiter";

export class UnlimitedRateLimiter implements RateLimiter {

    isAvailable = () => {
        return true;
    }

    register = () => {}

}

export class LimitedRateLimiter implements RateLimiter {

    private currentPeriodCount;
    private readonly maxPerPeriod;
    private readonly periodInMillis;

    constructor(maxPerPeriod: number, periodInMillis: number) {
        this.currentPeriodCount = 0;
        this.maxPerPeriod = maxPerPeriod;
        this.periodInMillis = periodInMillis;
    }

    isAvailable(): boolean {
        return this.currentPeriodCount < this.maxPerPeriod;
    }

    register(): void {
        this.currentPeriodCount++;
        setTimeout(() => this.currentPeriodCount--, this.periodInMillis)
    }

}
