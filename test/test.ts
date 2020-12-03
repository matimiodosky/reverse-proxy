import * as chai from 'chai';
import {it, describe} from 'mocha';
import chaiAsPromised = require("chai-as-promised");
import nock = require("nock");
import {createProxy} from "../src/reverse-proxy";
import fetch from 'node-fetch'

const HOST = 'http://google.com'
const PROXY_HOST = 'http://localhost'
const PATH = '/test'
const PORT = 8080;
const BODY = "Hello World!!!"

describe('Simple request', function () {
    it('ReverseProxy returns response', () => {

        chai.use(chaiAsPromised);
        const expect = chai.expect;

        //mock request
        nock(HOST)
            .get(PATH)
            .reply(200, BODY);

        //create proxy
        let proxy = createProxy({
            host: HOST,
            port: PORT,
            debug: true
        });
        proxy.init();

        //perform request
        return expect(
            fetch(`${PROXY_HOST}:${PORT}${PATH}`)
                .then(res => res.text())
        ).to.eventually.equal(BODY)
    });
});


