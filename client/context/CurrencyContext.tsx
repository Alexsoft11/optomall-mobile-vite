import { createContext, useContext, useState, ReactNode } from "react";

export type Currency = "USD" | "CNY" | "UZS";

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  convertPrice: (price: number) => string;
  exchangeRates: Record<Currency, number>;
}

const exchangeRates: Record<Currency, number> = {
  USD: 1,
  CNY: 7.24,
  UZS: 12450,
};

const currencySymbols: Record<Currency, string> = {
  USD: "$",
  CNY: "¥",
  UZS: "сўм",
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(
  undefined,
);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<Currency>("USD");

  const convertPrice = (price: number) => {
    const rate = exchangeRates[currency];
    const converted = price * rate;
    const symbol = currencySymbols[currency];

    if (currency === "UZS") {
      return `${converted.toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })} ${symbol}`;
    }

    return `${symbol}${converted.toFixed(2)}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        convertPrice,
        exchangeRates,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
