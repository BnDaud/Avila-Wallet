import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import apiClient from "../api/client";

export default function WithdrawModal({
  isVisible,
  onClose,
  tokens,
  onWithdrawSuccess,
}) {
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState(tokens[0]);
  const [isSending, setIsSending] = useState(false);

  const handleWithdraw = async () => {
    if (!address || !amount) {
      Alert.alert(
        "Wait!",
        "Please enter a valid destination address and amount.",
      );
      return;
    }
    setIsSending(true);
    try {
      const payload = {
        to_address: address.trim(),
        amount: amount.trim(),
      };
      if (selectedToken.address !== "")
        payload.token_address = selectedToken.address;

      await apiClient.post("wallets/withdraw/", payload);

      Alert.alert(
        "Success! 🚀",
        `Successfully sent ${amount} ${selectedToken.symbol}!`,
      );
      setAddress("");
      setAmount("");
      onWithdrawSuccess();
      onClose();
    } catch (error) {
      const msg = error.response?.data?.error || "Could not send funds.";
      Alert.alert("Transaction Failed", msg);
    } finally {
      setIsSending(false);
    }
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
            <Text style={styles.modalTitle}>Send Crypto</Text>
            <TouchableOpacity onPress={onClose}>
              <View style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.tokenSection}>
            <Text style={styles.inputLabel}>Select Asset</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.tokenScrollView}
            >
              {tokens.map((token, index) => {
                const isActive = selectedToken.symbol === token.symbol;
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.tokenPill,
                      isActive && styles.tokenPillActive,
                    ]}
                    onPress={() => setSelectedToken(token)}
                  >
                    <Image
                      source={{ uri: token.icon }}
                      style={{ width: 16, height: 16, marginRight: 6 }}
                    />
                    <Text
                      style={[
                        styles.tokenPillText,
                        isActive && styles.tokenPillTextActive,
                      ]}
                    >
                      {token.symbol}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Recipient Address</Text>
            <TextInput
              style={styles.textInput}
              placeholder="0x..."
              value={address}
              onChangeText={setAddress}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Amount ({selectedToken.symbol})
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder="0.00"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
          </View>

          <TouchableOpacity
            style={[styles.mainButton, isSending && { opacity: 0.7 }]}
            onPress={handleWithdraw}
            disabled={isSending}
          >
            {isSending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.mainButtonText}>
                Send {selectedToken.symbol}
              </Text>
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
    alignItems: "center",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 30,
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
  tokenSection: { width: "100%", marginBottom: 20 },
  tokenScrollView: { flexDirection: "row", paddingTop: 5, paddingBottom: 10 },
  tokenPill: {
    backgroundColor: "#f1f3f5",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
  },
  tokenPillActive: { backgroundColor: "#000" },
  tokenPillText: { color: "#666", fontWeight: "600" },
  tokenPillTextActive: { color: "#fff" },
  inputGroup: { width: "100%", marginBottom: 20 },
  inputLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    fontWeight: "600",
  },
  textInput: {
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#e9ecef",
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
  },
  mainButton: {
    backgroundColor: "#000",
    width: "100%",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 10,
  },
  mainButtonText: { color: "#fff", fontSize: 18, fontWeight: "700" },
});
