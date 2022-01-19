import chai from "chai";
import chaiHttp from "chai-http";
import nock from "nock";

import app from "../server.js";
import { getUserCurrencyBalance } from "../utils.js";
import { mockBTCData, mockETHData } from "./mockData.js";
import { exchangeUrl, currencyParam } from "../services/exchangeService.js";

chai.use(chaiHttp);

const { expect } = chai;

describe("Balance API", () => {
  describe("Happy flow", () => {
    beforeEach(() => {
      nock(exchangeUrl)
        .get(`/${currencyParam["BTC"]["USD"]}`)
        .reply(200, mockBTCData);
      nock(exchangeUrl)
        .get(`/${currencyParam["ETH"]["USD"]}`)
        .reply(200, mockETHData);
    });

    afterEach(() => {
      nock.cleanAll();
    });

    describe("User with both BTC and ETH holdings", () => {
      it("returns status 200 and correct balance", async () => {
        const userId = "user-1";

        const btcBalance = getUserCurrencyBalance(userId, "BTC");
        const ethBalance = getUserCurrencyBalance(userId, "ETH");
        const correctTotalBalance =
          btcBalance * mockBTCData.last + ethBalance * mockETHData.last;

        const res = await chai.request(app).get(`/${userId}/balance`);

        expect(res).to.have.status(200);
        expect(res.body.totalBalance).to.equal(correctTotalBalance);
      });
    });

    describe("User with only one holding", async () => {
      it("BTC only - returns status 200 and correct balance", async () => {
        const userId = "user-2";

        const btcBalance = getUserCurrencyBalance(userId, "BTC");
        const correctTotalBalance = btcBalance * mockBTCData.last;

        const res = await chai.request(app).get(`/${userId}/balance`);

        expect(res).to.have.status(200);
        expect(res.body.totalBalance).to.equal(correctTotalBalance);
      });

      it("ETH only - returns status 200 and correct balance", async () => {
        const userId = "user-3";

        const ethBalance = getUserCurrencyBalance(userId, "ETH");
        const correctTotalBalance = ethBalance * mockETHData.last;

        const res = await chai.request(app).get(`/${userId}/balance`);

        expect(res).to.have.status(200);
        expect(res.body.totalBalance).to.equal(correctTotalBalance);
      });
    });

    describe("User with no holdings", () => {
      it("returns status 200 and correct balance of 0", async () => {
        const userId = "user-4";
        const correctTotalBalance = 0;

        const res = await chai.request(app).get(`/${userId}/balance`);

        expect(res).to.have.status(200);
        expect(res.body.totalBalance).to.equal(correctTotalBalance);
      });
    });
  });

  describe("Crypto exchange is down", () => {
    it("returns status 500 and error message", async () => {
      nock(exchangeUrl).get(`/${currencyParam["BTC"]["USD"]}`).reply(500);

      const userId = "user-2";
      const res = await chai.request(app).get(`/${userId}/balance`);

      expect(res).to.have.status(500);
      expect(res.body.message).to.equal("Error retrieving prices");
    });
  });
});
