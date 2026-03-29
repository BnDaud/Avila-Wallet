import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import * as Clipboard from "expo-clipboard";

export default function DepositModal({ isVisible, onClose, walletAddress }) {
  const copyToClipboard = async () => {
    if (walletAddress) {
      await Clipboard.setStringAsync(walletAddress);
      Alert.alert("Copied! 📋", "Address copied to clipboard.");
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
            <Text style={styles.modalTitle}>Receive Funds</Text>
            <TouchableOpacity onPress={onClose}>
              <View style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.qrWrapper}>
            {walletAddress ? (
              <QRCode
                value={walletAddress}
                size={200}
                color="#000"
                backgroundColor="#fff"
              />
            ) : null}
          </View>

          <Text style={styles.warningText}>
            Send only{" "}
            <Text style={{ fontWeight: "bold" }}>Sepolia network</Text> assets
            to this address.
          </Text>

          <View style={styles.fullAddressBox}>
            <Text style={styles.fullAddressText}>
              {walletAddress || "Loading..."}
            </Text>
          </View>

          <TouchableOpacity style={styles.copyButton} onPress={copyToClipboard}>
            <Text style={styles.copyButtonText}>Copy Address</Text>
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
  qrWrapper: {
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 25,
  },
  warningText: {
    color: "#d32f2f",
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 10,
    marginBottom: 25,
    lineHeight: 20,
  },
  fullAddressBox: {
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 12,
    width: "100%",
    borderWidth: 1,
    borderColor: "#e9ecef",
    marginBottom: 15,
  },
  fullAddressText: {
    color: "#333",
    fontSize: 13,
    textAlign: "center",
    fontFamily: "monospace",
  },
  copyButton: {
    backgroundColor: "#000",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  copyButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
