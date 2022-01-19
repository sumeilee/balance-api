import express from "express";

import { getCurrencyPairPrice } from "./services/exchangeService.js";
import { getUserCurrencyBalance } from "./utils.js";
import { userBalances } from "./data/userBalances.js";

const app = express();

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/:userId/balance", async (req, res) => {
  try {
    const { userId } = req.params;
    const userBalance = userBalances[userId];

    // assume that userBalances only includes users with balances
    // i.e., registered users with no balances do not appear in list.
    // therefore, assume validation of users occurs elsewhere,
    // and that totalBalance should just be 0 if user is not in list
    if (!userBalance) {
      res.status(200).json({ totalBalance: 0 });
      return;
    }

    // get currencies that user holds
    const userCurrencies = Object.keys(userBalance);

    // get array of balances ordered by currencies
    const balance = userCurrencies.map((currency) =>
      getUserCurrencyBalance(userId, currency)
    );

    // get array of currency pair prices ordered by currencies
    const prices = await Promise.all(
      userCurrencies.map((currency) => getCurrencyPairPrice(currency, "USD"))
    );

    // get dot product of balance and price arrays for total balances
    const totalBalance = balance
      .map((bal, i) => bal * prices[i])
      .reduce((prev, curr) => prev + curr);

    res.status(200).json({ totalBalance });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

export default app;
