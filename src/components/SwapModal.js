import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Image,
  ScrollView,
} from "react-native";
import apiClient from "../api/client";

export default function SwapModal({
  isVisible,
  onClose,
  wallet,
  tokens,
  prices, // Received from Dashboard
  onSwapSuccess,
}) {
  const [swapFromToken, setSwapFromToken] = useState(tokens[0]);
  const [swapToToken, setSwapToToken] = useState(tokens[1]);
  const [swapAmount, setSwapAmount] = useState("");
  const [isSwapping, setIsSwapping] = useState(false);

  // --- LIVE CALCULATION LOGIC ---
  const getEstimatedReceive = () => {
    if (!swapAmount || isNaN(swapAmount)) return "0.00";

    const fromPrice = prices?.[swapFromToken.symbol]?.usd || 0;
    const toPrice = prices?.[swapToToken.symbol]?.usd || 0;

    if (fromPrice > 0 && toPrice > 0) {
      const result = (parseFloat(swapAmount) * fromPrice) / toPrice;
      return result.toFixed(6);
    }
    return "Fetching price...";
  };

  const handleSwap = async () => {
    if (!swapAmount || parseFloat(swapAmount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount to swap.");
      return;
    }

    setIsSwapping(true);
    try {
      const payload = {
        from_token: swapFromToken.address || "ETH",
        to_token: swapToToken.address || "ETH",
        amount: parseFloat(swapAmount),
      };

      await apiClient.post("wallets/swap/", payload);

      Alert.alert(
        "Swap Successful! 🔄",
        `Swapped ${swapAmount} ${swapFromToken.symbol} for ${swapToToken.symbol}.`,
      );

      setSwapAmount("");
      onSwapSuccess();
      onClose();
    } catch (error) {
      const msg =
        error.response?.data?.error ||
        "Swap failed. Check balance or slippage.";
      Alert.alert("Swap Failed", msg);
    } finally {
      setIsSwapping(false);
    }
  };

  const flipTokens = () => {
    const temp = swapFromToken;
    setSwapFromToken(swapToToken);
    setSwapToToken(temp);
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Swap Tokens</Text>
            <TouchableOpacity onPress={onClose}>
              <View style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* --- SELECT FROM TOKEN --- */}
          <View style={styles.labelRow}>
            <Text style={styles.inputLabel}>Pay with</Text>
            <Text style={styles.balanceText}>
              Bal: {wallet?.balances?.[swapFromToken.symbol] || "0.00"}
            </Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.selectorScroll}
          >
            {tokens.map((token, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.miniPill,
                  swapFromToken.symbol === token.symbol && styles.activePill,
                ]}
                onPress={() => setSwapFromToken(token)}
              >
                <Image source={{ uri: token.icon }} style={styles.tinyIcon} />
                <Text
                  style={[
                    styles.pillText,
                    swapFromToken.symbol === token.symbol &&
                      styles.activePillText,
                  ]}
                >
                  {token.symbol}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.swapCard}>
            <TextInput
              style={styles.swapAmountInput}
              placeholder="0.0"
              keyboardType="numeric"
              value={swapAmount}
              onChangeText={setSwapAmount}
              placeholderTextColor="#ccc"
            />
            <View style={styles.selectedDisplay}>
              <Image
                source={{ uri: swapFromToken.icon }}
                style={styles.mediumIcon}
              />
              <Text style={styles.tokenNameText}>{swapFromToken.symbol}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.swapCircle} onPress={flipTokens}>
            <Text style={{ fontSize: 20 }}>⇅</Text>
          </TouchableOpacity>

          {/* --- SELECT TO TOKEN --- */}
          <Text style={styles.inputLabel}>Receive</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.selectorScroll}
          >
            {tokens.map((token, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.miniPill,
                  swapToToken.symbol === token.symbol && styles.activePill,
                ]}
                onPress={() => setSwapToToken(token)}
              >
                <Image source={{ uri: token.icon }} style={styles.tinyIcon} />
                <Text
                  style={[
                    styles.pillText,
                    swapToToken.symbol === token.symbol &&
                      styles.activePillText,
                  ]}
                >
                  {token.symbol}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.swapCard}>
            <Text style={[styles.swapAmountInput, { color: "#999" }]}>
              {getEstimatedReceive()}
            </Text>
            <View style={styles.selectedDisplay}>
              <Image
                source={{ uri: swapToToken.icon }}
                style={styles.mediumIcon}
              />
              <Text style={styles.tokenNameText}>{swapToToken.symbol}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.mainButton, isSwapping && { opacity: 0.7 }]}
            onPress={handleSwap}
            disabled={isSwapping}
          >
            {isSwapping ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.mainButtonText}>Confirm Swap</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: { fontSize: 22, fontWeight: "800", color: "#000" },
  closeButton: {
    backgroundColor: "#f1f3f5",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: { fontSize: 18, fontWeight: "bold", color: "#333" },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  balanceText: { fontSize: 12, color: "#888", fontWeight: "600" },
  inputLabel: {
    fontSize: 13,
    color: "#666",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  selectorScroll: { marginBottom: 15 },
  miniPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f3f5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "transparent",
  },
  activePill: { backgroundColor: "#000", borderColor: "#000" },
  pillText: { fontSize: 12, fontWeight: "600", color: "#666" },
  activePillText: { color: "#fff" },
  swapCard: {
    backgroundColor: "#f8f9fa",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#eee",
  },
  swapAmountInput: { fontSize: 24, fontWeight: "700", color: "#000", flex: 1 },
  selectedDisplay: { flexDirection: "row", alignItems: "center" },
  tokenNameText: { fontWeight: "800", fontSize: 16, marginLeft: 8 },
  tinyIcon: { width: 16, height: 16, marginRight: 6 },
  mediumIcon: { width: 24, height: 24 },
  swapCircle: {
    alignSelf: "center",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    marginVertical: -12,
    elevation: 3,
  },
  mainButton: {
    backgroundColor: "#000",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 25,
  },
  mainButtonText: { color: "#fff", fontSize: 18, fontWeight: "700" },
});
