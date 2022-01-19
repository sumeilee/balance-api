import { userBalances } from "./data/userBalances.js";

export const getUserCurrencyBalance = (userId, currency) => {
  const userBalance = userBalances[userId];

  if (!userBalance) {
    return 0;
  }

  return parseFloat(userBalance[currency]) || 0;
};
