import axios from "axios";

export const exchangeUrl = "https://www.bitstamp.net/api/v2/ticker";

export const currencyParam = {
  BTC: { USD: "btcusd" },
  ETH: { USD: "ethusd" },
};

export const getCurrencyPairPrice = async (currency1, currency2) => {
  try {
    const response = await axios.get(
      `${exchangeUrl}/${currencyParam[currency1][currency2]}`
    );
    const price = response.data.last;

    return price;
  } catch (err) {
    throw Error("Error retrieving prices");
  }
};
