import axios from "axios";

const assets = {
  btc: { label: "Bitcoin", networks: ["bitcoin"] },
  eth: { label: "Ethereum", networks: ["ethereum"] },
  ltc: { label: "Litecoin", networks: ["litecoin"] },
  usdt: { label: "USDT", networks: ["ethereum", "tron", "bsc", "polygon"] }
};

const networks = {
  bitcoin: { label: "Bitcoin", decimals: 8, baseUrl: "https://api.blockcypher.com/v1/btc/main" },
  ethereum: { label: "Ethereum ERC20", decimals: 18, baseUrl: "https://api.blockcypher.com/v1/eth/main" },
  litecoin: { label: "Litecoin", decimals: 8, baseUrl: "https://api.blockcypher.com/v1/ltc/main" },
  tron: { label: "Tron TRC20" },
  bsc: { label: "BNB Smart Chain BEP20" },
  polygon: { label: "Polygon PoS" }
};

export function getSupportedNetworks() {
  return {
    currencies: Object.entries(assets).map(([id, asset]) => ({ id, label: asset.label, networks: asset.networks })),
    networks: Object.entries(networks).map(([id, network]) => ({ id, label: network.label }))
  };
}

export async function verifyTransaction({ txid, walletAddress, network, currency, requestedAmount }) {
  const selected = networks[network];
  const asset = assets[currency];

  if (!selected) {
    const error = new Error("Unsupported network");
    error.statusCode = 400;
    throw error;
  }

  if (!asset || !asset.networks.includes(network)) {
    const error = new Error("Selected currency is not available on this network");
    error.statusCode = 400;
    throw error;
  }

  if (currency === "usdt") {
    return verifyUsdtTransaction({ txid, walletAddress, network, selected, asset, requestedAmount });
  }

  return verifyNativeTransaction({ txid, walletAddress, selected, asset, requestedAmount });
}

async function verifyNativeTransaction({ txid, walletAddress, selected, asset, requestedAmount }) {
  try {
    const { data } = await axios.get(`${selected.baseUrl}/txs/${encodeURIComponent(txid)}`, { timeout: 12000 });
    const inputs = data.inputs || [];
    const outputs = data.outputs || [];
    const sender = inputs[0]?.addresses?.[0] || "Unknown";
    const receiverOutput = outputs.find((output) => output.addresses?.includes(walletAddress)) || outputs[0] || {};
    const receiver = receiverOutput.addresses?.[0] || "Unknown";
    const amount = Number(receiverOutput.value || data.total || 0) / 10 ** selected.decimals;
    const confirmations = Number(data.confirmations || 0);

    return {
      txid,
      walletAddress,
      currency: asset.label,
      requestedAmount,
      network: selected.label,
      sender,
      receiver,
      amount,
      blockNumber: data.block_height && data.block_height > 0 ? data.block_height : null,
      confirmations,
      confirmed: confirmations > 0,
      rawStatus: confirmations > 0 ? "confirmed" : "pending"
    };
  } catch (error) {
    if (error.response?.status === 404) {
      const notFound = new Error("Transaction not found on selected network");
      notFound.statusCode = 404;
      throw notFound;
    }

    const apiError = new Error("Unable to verify transaction right now");
    apiError.statusCode = 502;
    throw apiError;
  }
}

async function verifyUsdtTransaction({ txid, walletAddress, network, selected, asset, requestedAmount }) {
  if (network === "tron") {
    try {
      const { data } = await axios.get(`https://api.trongrid.io/v1/transactions/${encodeURIComponent(txid)}/events`, {
        timeout: 12000
      });
      const event = data?.data?.find((item) => item.event_name === "Transfer") || data?.data?.[0];
      const result = event?.result || {};
      const amount = Number(result.value || 0) / 1_000_000;

      return {
        txid,
        walletAddress,
        currency: asset.label,
        requestedAmount,
        network: selected.label,
        sender: result.from || "Unknown",
        receiver: result.to || walletAddress,
        amount,
        blockNumber: event?.block_number || null,
        confirmations: event ? 1 : 0,
        confirmed: Boolean(event),
        rawStatus: event ? "confirmed" : "pending"
      };
    } catch (_error) {
      // Other USDT networks usually need explorer API keys. We still save the request for admin review.
    }
  }

  return {
    txid,
    walletAddress,
    currency: asset.label,
    requestedAmount,
    network: selected.label,
    sender: "Explorer review required",
    receiver: walletAddress,
    amount: 0,
    blockNumber: null,
    confirmations: 0,
    confirmed: false,
    rawStatus: "manual-review"
  };
}
