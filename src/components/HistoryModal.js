import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  ScrollView,
  Linking,
} from "react-native";

export default function HistoryModal({
  isVisible,
  onClose,
  isLoading,
  transactions,
  resolveTokenSymbol,
}) {
  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { height: "85%" }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Transaction History</Text>
            <TouchableOpacity onPress={onClose}>
              <View style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </View>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <ActivityIndicator
              size="large"
              color="#000"
              style={{ marginTop: 50 }}
            />
          ) : (
            <ScrollView
              style={{ width: "100%" }}
              showsVerticalScrollIndicator={false}
            >
              {transactions.length === 0 ? (
                <Text style={styles.emptyHistoryText}>
                  No transactions found.
                </Text>
              ) : (
                transactions.map((tx) => {
                  const txType =
                    tx.transaction_type?.toUpperCase() || "WITHDRAWAL";
                  const formattedDate = new Date(tx.timestamp).toLocaleString(
                    undefined,
                    {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  );

                  const sourceAsset = resolveTokenSymbol(tx.from_token);
                  const destAsset = resolveTokenSymbol(tx.to_token);

                  let titleText = "";
                  let txIcon = "📤";
                  let iconBgColor = "#ffebee";

                  if (txType === "SWAP") {
                    titleText = `Swap ${sourceAsset} for ${destAsset}`;
                    txIcon = "🔄";
                    iconBgColor = "#e3f2fd";
                  } else if (txType === "DEPOSIT") {
                    titleText = `Deposit ${sourceAsset}`;
                    txIcon = "📥";
                    iconBgColor = "#e8f5e9";
                  } else {
                    titleText = `Withdraw ${sourceAsset}`;
                    txIcon = "📤";
                    iconBgColor = "#ffebee";
                  }

                  return (
                    <View key={tx.id} style={styles.txRow}>
                      <View style={styles.txLeft}>
                        <View
                          style={[
                            styles.txIconContainer,
                            { backgroundColor: iconBgColor },
                          ]}
                        >
                          <Text style={styles.txIconText}>{txIcon}</Text>
                        </View>
                        <View>
                          <Text style={styles.txTitle}>{titleText}</Text>
                          <Text style={styles.txDate}>{formattedDate}</Text>
                        </View>
                      </View>
                      <View style={styles.txRight}>
                        <Text style={styles.txAmount}>
                          {parseFloat(tx.amount).toFixed(4)}
                        </Text>
                        <TouchableOpacity
                          onPress={() => Linking.openURL(tx.explorer_url)}
                        >
                          <Text style={styles.explorerLink}>View Tx ↗</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })
              )}
            </ScrollView>
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
  emptyHistoryText: {
    textAlign: "center",
    color: "#999",
    fontSize: 16,
    marginTop: 40,
  },
  txRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f3f5",
  },
  txLeft: { flexDirection: "row", alignItems: "center" },
  txIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  txIconText: { fontSize: 18 },
  txTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  txDate: { fontSize: 13, color: "#888" },
  txRight: { alignItems: "flex-end" },
  txAmount: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  explorerLink: { fontSize: 13, color: "#007bff", fontWeight: "600" },
});
