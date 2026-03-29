import React from "react";
import { View, Text, StyleSheet, Image, FlatList } from "react-native";

export default function AssetList({
  wallet,
  tokens,
  prices,
  headerComponent,
  refreshControl,
}) {
  const getSortedAssets = () => {
    return tokens
      .map((token) => {
        const balance = parseFloat(wallet?.balances?.[token.symbol] || 0);
        // Fallback to 0 if price isn't loaded yet
        const priceInfo = prices?.[token.symbol] || { usd: 0, change: 0 };
        // Handle both object { usd: 10 } and raw number structures based on your price API
        const currentPrice =
          typeof priceInfo === "object" ? priceInfo.usd || 0 : priceInfo;
        const change24h =
          typeof priceInfo === "object" ? priceInfo.change || 0 : 0;

        return {
          ...token,
          balance,
          usdWorth: balance * currentPrice,
          currentPrice: currentPrice,
          change24h: change24h,
        };
      })
      .sort((a, b) => b.usdWorth - a.usdWorth);
  };

  const renderAssetItem = ({ item: asset }) => (
    <View style={styles.row}>
      <View style={styles.left}>
        <Image source={{ uri: asset.icon }} style={styles.icon} />
        <View>
          <Text style={styles.symbol}>{asset.symbol}</Text>
          <Text
            style={[
              styles.trend,
              { color: asset.change24h >= 0 ? "#4caf50" : "#d32f2f" },
            ]}
          >
            $
            {asset.currentPrice.toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })}
            ({asset.change24h >= 0 ? "+" : ""}
            {asset.change24h.toFixed(2)}%)
          </Text>
        </View>
      </View>
      <View style={styles.right}>
        <Text style={styles.balance}>
          {asset.balance > 0 ? asset.balance.toFixed(4) : "0.00"}
        </Text>
        <Text style={styles.usdValue}>
          $
          {asset.usdWorth.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
      </View>
    </View>
  );

  return (
    <FlatList
      data={getSortedAssets()}
      renderItem={renderAssetItem}
      keyExtractor={(item) => item.symbol}
      showsVerticalScrollIndicator={false}
      refreshControl={refreshControl}
      ListHeaderComponent={
        <View>
          {headerComponent}
          <Text style={styles.title}>My Assets</Text>
        </View>
      }
      contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
      style={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1a1a1a",
    marginBottom: 15,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  left: { flexDirection: "row", alignItems: "center" },
  icon: { width: 42, height: 42, marginRight: 12 },
  symbol: { fontSize: 16, fontWeight: "700", color: "#000" },
  trend: { fontSize: 12, fontWeight: "600", marginTop: 2 },
  right: { alignItems: "flex-end" },
  balance: { fontSize: 16, fontWeight: "700", color: "#000" },
  usdValue: { fontSize: 13, color: "#888", marginTop: 2, fontWeight: "500" },
});
