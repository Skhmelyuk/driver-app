import { StyleSheet } from "react-native";

export const registerStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    backgroundColor: "#F2F2F7",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  formContainer: {
    gap: 16,
    marginBottom: 24,
  },
  inputWrapper: {
    width: "100%",
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
    color: "#000",
  },
  inputError: {
    borderColor: "#FF3B30",
  },
  phoneInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 0,
  },
  phonePrefix: {
    paddingHorizontal: 16,
    height: "100%",
    justifyContent: "center",
  },
  phonePrefixText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
  },
  separator: {
    width: 1,
    height: "60%",
    backgroundColor: "#E5E5EA",
  },
  phoneInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 15,
    fontSize: 16,
    color: "#000",
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 30,
    gap: 12,
  },
  checkboxTouch: {
    marginTop: 2,
  },
  termsText: {
    flex: 1,
    fontSize: 12,
    color: "#8E8E93",
    lineHeight: 18,
  },
  termsLink: {
    color: "#7900FF",
  },
  submitButton: {
    backgroundColor: "#7900FF",
    height: 56,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#D1D1D6",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
