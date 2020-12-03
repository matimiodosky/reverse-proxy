import {createProxy} from "./reverse-proxy";

const SECOND_IN_MILLIS = 1000;

const wikipediaProxy = createProxy({
    host: 'https://es.wikipedia.org/',
    port: 8084,
    filteredResponseHeaders: ['content-encoding', 'content-security-policy'],
    ignoreRequestHeaders: true,
    maxTransactions: 10,
    maxTransactionsPeriodInMillis: SECOND_IN_MILLIS
});


wikipediaProxy.init();


