import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  ScrollView,
  RefreshControl,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";
import apiClient from "../api/client";
import { fetchLivePrices } from "../api/priceService";

// --- COMPONENTS ---
import DepositModal from "../components/DepositModal";
import WithdrawModal from "../components/WithdrawModal";
import BuyModal from "../components/BuyModal";
import SwapModal from "../components/SwapModal";
import HistoryModal from "../components/HistoryModal";
import AssetList from "../components/AssetList";

const SUPPORTED_TOKENS = [
  {
    symbol: "ETH",
    name: "Ethereum",
    address: "0x0000000000000000000000000000000000000000",
    icon: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
    icon: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png",
  },
  {
    symbol: "UNI",
    name: "Uniswap",
    address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
    icon: "https://cryptologos.cc/logos/uniswap-uni-logo.png",
  },
  {
    symbol: "WETH",
    name: "Wrapped ETH",
    address: "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14",
    icon: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
  },
  {
    symbol: "WBTC",
    name: "Wrapped BTC",
    address: "0x29f39dE984eBb3f4d05373303d94ED0516244301",
    icon: "https://cryptologos.cc/logos/wrapped-bitcoin-wbtc-logo.png",
  },
  {
    symbol: "USDT",
    name: "Tether",
    address: "0x7169D38820dfd117C3FA1f22a697dBA58d90bA06",
    icon: "https://cryptologos.cc/logos/tether-usdt-logo.png",
  },
  {
    symbol: "LINK",
    name: "Chainlink",
    address: "0x779877A7B0D9E8603169DdbD7836e478b4624789",
    icon: "https://cryptologos.cc/logos/chainlink-link-logo.png",
  },
  {
    symbol: "DAI",
    name: "Dai",
    address: "0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357",
    icon: "https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png",
  },
  {
    symbol: "POL",
    name: "Polygon",
    address: "0x455e53CBB86018Ac2B8092FdCd39d8444aFFC3F6",
    icon: "https://cryptologos.cc/logos/polygon-matic-logo.png",
  },
  {
    symbol: "SHIB",
    name: "Shiba Inu",
    address: "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE",
    icon: "https://cryptologos.cc/logos/shiba-inu-shib-logo.png",
  },
];

export default function DashboardScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [wallet, setWallet] = useState(null);
  const [prices, setPrices] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modals states
  const [isDepositVisible, setIsDepositVisible] = useState(false);
  const [isWithdrawVisible, setIsWithdrawVisible] = useState(false);
  const [isBuyVisible, setIsBuyVisible] = useState(false);
  const [isSwapVisible, setIsSwapVisible] = useState(false);
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    loadPrices();
    const priceInterval = setInterval(loadPrices, 120000);
    return () => clearInterval(priceInterval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await apiClient.get("wallets/me/");
      setWallet(response.data);
    } catch (error) {
      Alert.alert("Error", "Session expired.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadPrices = async () => {
    try {
      const data = await fetchLivePrices();
      if (data) setPrices(data);
    } catch (error) {
      console.log("Error loading prices", error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchDashboardData(), loadPrices()]);
    setRefreshing(false);
  }, []);

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync("accessToken");
    navigation.replace("Login");
  };

  const fetchHistoryData = async () => {
    setIsHistoryVisible(true);
    setIsLoadingHistory(true);
    try {
      const response = await apiClient.get("transactions/history/");
      setTransactions(response.data);
    } catch (error) {
      Alert.alert("Error", "Could not load history.");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const totalPortfolioValue = useMemo(() => {
    if (!wallet?.balances || !prices) return 0;
    let total = 0;
    SUPPORTED_TOKENS.forEach((token) => {
      const balance = parseFloat(wallet.balances[token.symbol] || 0);
      const priceData = prices[token.symbol];
      const price =
        typeof priceData === "object"
          ? parseFloat(priceData?.usd || 0)
          : parseFloat(priceData || 0);
      total += balance * price;
    });
    return total;
  }, [wallet, prices]);

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  // --- PACKAGE THE HEADER TO PASS TO THE LIST ---
  const dashboardHeader = (
    <View style={{ paddingBottom: 10 }}>
      <View style={styles.header}>
        <View style={styles.userInfoRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(wallet?.user?.first_name?.[0] || "") +
                (wallet?.user?.last_name?.[0] || "")}
            </Text>
          </View>
          <View>
            <Text style={styles.greeting}>Welcome back 👋</Text>
            <Text style={styles.userName}>
              {wallet?.user?.first_name} {wallet?.user?.last_name}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.label}>Portfolio Value</Text>
          <View style={styles.networkBadge}>
            <Text style={styles.networkText}>Sepolia</Text>
          </View>
        </View>
        <Text style={styles.balance}>
          $
          {totalPortfolioValue.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
        <View style={styles.addressBox}>
          <Text style={styles.addressText}>
            {wallet?.address?.slice(0, 10)}...{wallet?.address?.slice(-4)}
          </Text>
        </View>
      </View>

      <View style={styles.actionRowContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.actionScrollRow}
        >
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setIsDepositVisible(true)}
          >
            <Text style={styles.actionText}>Deposit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setIsWithdrawVisible(true)}
          >
            <Text style={styles.actionText}>Withdraw</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setIsBuyVisible(true)}
          >
            <Text style={styles.actionText}>Buy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setIsSwapVisible(true)}
          >
            <Text style={styles.actionText}>Swap</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={fetchHistoryData}
          >
            <Text style={styles.actionText}>History</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );

  return (
    <View
      style={[styles.mainWrapper, { paddingTop: Math.max(insets.top, 25) }]}
    >
      <StatusBar hidden={true} />

      {/* The AssetList now handles all scrolling for the screen */}
      <AssetList
        wallet={wallet}
        tokens={SUPPORTED_TOKENS}
        prices={prices}
        headerComponent={dashboardHeader}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FF9800"
          />
        }
      />

      <DepositModal
        isVisible={isDepositVisible}
        onClose={() => setIsDepositVisible(false)}
        walletAddress={wallet?.address}
      />
      <WithdrawModal
        isVisible={isWithdrawVisible}
        onClose={() => setIsWithdrawVisible(false)}
        tokens={SUPPORTED_TOKENS}
        onWithdrawSuccess={fetchDashboardData}
      />
      <BuyModal
        isVisible={isBuyVisible}
        onClose={() => setIsBuyVisible(false)}
        walletAddress={wallet?.address}
        tokens={SUPPORTED_TOKENS}
      />
      <SwapModal
        isVisible={isSwapVisible}
        onClose={() => setIsSwapVisible(false)}
        wallet={wallet}
        tokens={SUPPORTED_TOKENS}
        prices={prices}
        onSwapSuccess={fetchDashboardData}
      />
      <HistoryModal
        isVisible={isHistoryVisible}
        onClose={() => setIsHistoryVisible(false)}
        isLoading={isLoadingHistory}
        transactions={transactions}
        resolveTokenSymbol={(id) => id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainWrapper: { flex: 1, backgroundColor: "#f8f9fa" },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  userInfoRow: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  greeting: { fontSize: 12, color: "#666" },
  userName: { fontSize: 18, fontWeight: "900", color: "#1a1a1a" },
  logoutButton: { backgroundColor: "#ffebee", padding: 8, borderRadius: 12 },
  logoutText: { color: "#d32f2f", fontSize: 12, fontWeight: "700" },
  card: {
    backgroundColor: "#000",
    borderRadius: 24,
    padding: 25,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: { color: "#888", fontSize: 14 },
  networkBadge: {
    backgroundColor: "#111",
    padding: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#333",
  },
  networkText: { color: "#4caf50", fontSize: 10, fontWeight: "bold" },
  balance: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "800",
    marginVertical: 12,
  },
  addressBox: { backgroundColor: "#111", padding: 10, borderRadius: 12 },
  addressText: {
    color: "#4caf50",
    fontSize: 11,
    textAlign: "center",
    fontFamily: "monospace",
  },
  actionRowContainer: { marginBottom: 10 },
  actionScrollRow: { paddingVertical: 10 },
  actionButton: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 15,
    marginRight: 10,
    elevation: 2,
  },
  actionText: { fontWeight: "700", fontSize: 14 },
});
