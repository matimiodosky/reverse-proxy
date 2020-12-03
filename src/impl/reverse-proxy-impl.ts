import {Express} from "express";
import {Logger} from "tslog";
import * as express from "express";
import fetch from "node-fetch";
import {IncomingHttpHeaders} from "http";
import {CreateOptions, DEFAULT_PORT, ReverseProxy} from "../reverse-proxy";
import * as morgan from 'morgan';
import {RateLimiter} from "../rateLimiter";
import {LimitedRateLimiter, UnlimitedRateLimiter} from "./RateLimiterImpl";

export class ProxyImpl implements ReverseProxy {

    private readonly host: string;
    private readonly port: number;
    private readonly logger: Logger;
    private readonly debug: boolean;

    private readonly filteredResponseHeaders: string[]
    private readonly filteredRequestHeaders: string[]

    private readonly ignoreResponseHeaders: boolean
    private readonly ignoreRequestHeaders: boolean;

    private expressApp: Express;

    private readonly rateLimiter: RateLimiter;

    constructor(options: CreateOptions) {
        ({
            host: this.host,
            port: this.port = DEFAULT_PORT,
            debug: this.debug = false,
            filteredResponseHeaders: this.filteredResponseHeaders = [],
            filteredRequestHeaders: this.filteredRequestHeaders = [],
            ignoreResponseHeaders: this.ignoreResponseHeaders = false,
            ignoreRequestHeaders: this.ignoreRequestHeaders = false,
        } = options);

        this.rateLimiter = options.maxTransactions ? new LimitedRateLimiter(options.maxTransactions,options.maxTransactionsPeriodInMillis) : new UnlimitedRateLimiter();

        this.logger = new Logger({minLevel: options.debug ? "debug" : "info"})
        this.logger.debug(`reverse proxy initalized with options: ${JSON.stringify(options)} `)
    }

    init(): void {
        this.logger.info("initializing reverse proxy: " + this.host)

        this.logger.debug("debug=true")

        this.expressApp = express();

        this.expressApp.listen(this.port)

        this.expressApp.use(morgan('dev'))

        this.expressApp.all("*", (req, res) => {
            this.handleRequest(req, res);
        })

        this.logger.debug("initialized reverse proxy: " + this.host)
    }

    private handleRequest(req, res) {
        if (!this.rateLimiter.isAvailable()) return res.status(503).send("Service unavailable")

        this.logger.debug(`fetching response for: ${this.host + req.url}`)
        this.rateLimiter.register();

        fetch(this.host + req.url, {
            method: req.method,
            body: req.body,
            headers: this.getRequestHeaders(req.headers)
        })
            .then(this.fillResponse(res))
            .then(proxyResponse => proxyResponse.text())
            .then(proxyResponse => res.send(proxyResponse))
            .catch(this.handleError(res))
    }

    private handleError(res) {
        return err => {
            this.logger.error(JSON.stringify(err))
            res.send(JSON.stringify(err))
        };
    }

    private fillResponse(res) {
        return proxyResponse => {
            !this.ignoreResponseHeaders && this.fillResponseHeaders(proxyResponse, res);
            res.status(proxyResponse.status)
            return proxyResponse;
        };
    }

    private getRequestHeaders: (headers: IncomingHttpHeaders) => [string, string][] = (headers: IncomingHttpHeaders) =>
        this.ignoreRequestHeaders ? [] : Object
            .keys(headers)
            .filter(header => !this.filteredRequestHeaders.includes(header))
            .map(key => {
                return [key, headers[key].toString()]
            })


    private fillResponseHeaders = (fetched, res) => {
        fetched
            .headers
            .forEach((value, name) =>
                !this.filteredResponseHeaders.includes(name) && res.setHeader(name, value)
            );
    }
}
