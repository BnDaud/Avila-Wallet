import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { WebView } from "react-native-webview";

export default function BuyModal({
  isVisible,
  onClose,
  walletAddress,
  tokens,
}) {
  const [buyToken, setBuyToken] = useState(tokens[0]);

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        {/* FIXED: Changed <div> to <View> */}
        <View style={[styles.modalContent, { height: "90%" }]}>
          <View
            style={[styles.modalHeader, { padding: 20, paddingBottom: 15 }]}
          >
            <Text style={styles.modalTitle}>Buy Crypto</Text>
            <TouchableOpacity onPress={onClose}>
              <View style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={{ paddingHorizontal: 20, marginBottom: 10 }}>
            <Text style={styles.inputLabel}>Select Asset to Buy</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {tokens.map((token, index) => {
                const isActive = buyToken.symbol === token.symbol;
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.tokenPill,
                      isActive && styles.tokenPillActive,
                    ]}
                    onPress={() => setBuyToken(token)}
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

          {walletAddress ? (
            <View style={{ flex: 1, borderTopWidth: 1, borderColor: "#eee" }}>
              <WebView
                source={{
                  uri: `https://buy.moonpay.com/?walletAddress=${walletAddress}&currencyCode=${buyToken.symbol.toLowerCase()}`,
                }}
                style={{ flex: 1 }}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
                renderLoading={() => (
                  <ActivityIndicator
                    size="large"
                    color="#000"
                    style={styles.loader}
                  />
                )}
              />
            </View>
          ) : (
            <View style={{ flex: 1, justifyContent: "center" }}>
              <ActivityIndicator size="large" color="#000" />
            </View>
          )}
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
    overflow: "hidden", // Ensures the WebView respects the rounded corners
    paddingBottom: 0,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#000",
  },
  closeButton: {
    backgroundColor: "#f1f3f5",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  tokenPill: {
    backgroundColor: "#f1f3f5",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    marginTop: 10,
  },
  tokenPillActive: {
    backgroundColor: "#000",
  },
  tokenPillText: {
    color: "#666",
    fontWeight: "600",
  },
  tokenPillTextActive: {
    color: "#fff",
  },
  inputLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
  loader: {
    position: "absolute",
    top: "40%",
    alignSelf: "center",
  },
});
