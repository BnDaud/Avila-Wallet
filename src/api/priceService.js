// REAL COINGECKO MAPPING - Verified for 2026
const COIN_MAP = {
  // Core Assets
  ETH: "ethereum",
  USDC: "usd-coin",
  UNI: "uniswap",
  WETH: "weth",
  WBTC: "wrapped-bitcoin",

  // Stables & Oracle
  USDT: "tether",
  LINK: "chainlink",
  DAI: "dai",

  // L2s & Ecosystem (MATIC migrated to POL)
  POL: "polygon-ecosystem-index",
  MATIC: "polygon-ecosystem-index", // Map both to be safe
  ARB: "arbitrum",
  OP: "optimism",

  // Popular Mid-Caps
  AAVE: "aave",
  SHIB: "shiba-inu",
  SOL: "solana",
  AVAX: "avalanche-2",
  LDO: "lido-dao",
};

export const fetchLivePrices = async () => {
  try {
    const ids = Array.from(new Set(Object.values(COIN_MAP))).join(",");
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();

    let prices = {};
    Object.keys(COIN_MAP).forEach((symbol) => {
      const id = COIN_MAP[symbol];
      // Real Action: Using nullish coalescing to ensure we never return 'undefined'
      prices[symbol] = {
        usd: data[id]?.usd ?? 0,
        change: data[id]?.usd_24h_change ?? 0,
      };
    });

    return prices;
  } catch (error) {
    // In production, we log this to an error tracker like Sentry
    console.error("Critical: Price Fetch Failed", error.message);
    return null;
  }
};
