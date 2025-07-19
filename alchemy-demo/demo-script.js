// Installation: npm install alchemy-sdk
import { Alchemy, Network, AlchemySubscription } from "alchemy-sdk";

const settings = {
  apiKey: "UOl6hNcocLE9oB4bbBC9g",
  network: Network.ETH_MAINNET,
};

const alchemy = new Alchemy(settings);

// Subscription for Alchemy's minedTransactions API
alchemy.ws.on(
  {
    method: AlchemySubscription.MINED_TRANSACTIONS,
    addresses: [
      {
        from: "0x473780deaf4a2ac070bbba936b0cdefe7f267dfc",
      },
      {
        to: "0x473780deaf4a2ac070bbba936b0cdefe7f267dfc",
      },
    ],
    includeRemoved: true,
    hashesOnly: false,
  },
  (tx) => console.log(tx)
);