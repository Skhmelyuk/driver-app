import { StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";

const palette = {
  screen: "#F4F2F8",
  fieldBg: "#FFFFFF",
  fieldBorder: "#E4E1EE",
  textPrimary: "#1F1B2D",
  textSecondary: "#8C88A3",
  accent: "#F75555",
  saveDisabled: "#D4D1DE",
};

export const profileStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.screen,
  },
  screen: {
    flex: 1,
  },
  screenLayout: {
    flex: 1,
    justifyContent: "space-between",
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 100, // Added more bottom padding for keyboard
    justifyContent: "flex-start",
  },
  contentCompact: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 80,
    justifyContent: "flex-start",
  },
  contentNarrow: {
    paddingHorizontal: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 0,
  },
  headerCompact: {
    marginTop: 0,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.fieldBorder,
    backgroundColor: palette.fieldBg,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "700",
    color: palette.textPrimary,
  },
  headerSpacer: {
    width: 44,
  },
  headerRight: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarSection: {
    alignItems: "center",
    marginTop: 16,
  },
  avatarSectionCompact: {
    marginTop: 12,
  },
  avatarWrapper: {
    width: 140,
    height: 140,
    borderRadius: 100,
    backgroundColor: "#D9D7E7",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarWrapperCompact: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  avatarImage: {
    width: 140,
    height: 140,
    borderRadius: 100,
    overflow: "hidden",
  },
  avatarImageCompact: {
    width: 110,
    height: 110,
    borderRadius: 55,
    overflow: "hidden",
  },
  avatarPlaceholderText: {
    fontSize: 36,
    fontWeight: "700",
    color: "#A5A2BA",
  },
  avatarPlaceholderCompact: {
    fontSize: 30,
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: palette.screen,
  },
  cameraButtonCompact: {
    width: 32,
    height: 32,
    borderRadius: 16,
    bottom: 0,
    right: 0,
    borderWidth: 3,
  },
  helperText: {
    marginTop: 12,
    fontSize: 12,
    color: palette.textSecondary,
  },
  helperTextCompact: {
    marginTop: 8,
    fontSize: 11,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: palette.textPrimary,
    marginBottom: 10,
  },
  sectionTitleCompact: {
    fontSize: 18,
    marginBottom: 8,
  },
  formSection: {
    marginTop: 20,
  },
  formSectionCompact: {
    marginTop: 16,
  },
  formSectionNarrow: {
    width: "100%",
  },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  nameRowStack: {
    flexDirection: "column",
  },
  nameField: {
    flex: 1,
  },
  nameFieldSpacing: {
    marginLeft: 12,
  },
  nameFieldFull: {
    width: "100%",
  },
  nameFieldStacked: {
    marginTop: 12,
  },
  field: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.fieldBorder,
    backgroundColor: palette.fieldBg,
    paddingHorizontal: 16,
    fontSize: 16,
    color: palette.textPrimary,
  },
  fieldCompact: {
    height: 48,
    borderRadius: 10,
    fontSize: 15,
  },
  fieldError: {
    borderColor: palette.accent,
  },
  phoneContainerError: {
    borderColor: palette.accent,
  },
  phoneRow: {
    marginTop: 12,
  },
  phoneRowCompact: {
    marginTop: 10,
  },
  phoneContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.fieldBorder,
    backgroundColor: palette.fieldBg,
  },
  phoneContainerCompact: {
    height: 48,
    borderRadius: 10,
  },
  phonePrefix: {
    paddingHorizontal: 16,
    height: "100%",
    justifyContent: "center",
    borderRightWidth: 1,
    borderRightColor: palette.fieldBorder,
  },
  phonePrefixCompact: {
    paddingHorizontal: 14,
  },
  phonePrefixText: {
    fontSize: 16,
    fontWeight: "600",
    color: palette.textPrimary,
  },
  phoneInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 16,
    fontSize: 16,
    color: palette.textPrimary,
  },
  phoneInputCompact: {
    paddingHorizontal: 14,
    fontSize: 15,
  },
  dateFieldWrapper: {
    marginTop: 12,
  },
  dateField: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.fieldBorder,
    backgroundColor: palette.fieldBg,
    height: 52,
    paddingHorizontal: 16,
  },
  dateFieldCompact: {
    height: 48,
    borderRadius: 10,
    paddingHorizontal: 14,
  },
  datePart: {
    width: 36,
    fontSize: 16,
    color: palette.textPrimary,
    textAlign: "center",
  },
  dateSeparator: {
    fontSize: 16,
    color: palette.textSecondary,
    marginHorizontal: 4,
  },
  dateChevron: {
    marginLeft: "auto",
    color: palette.textSecondary,
  },
  errorText: {
    marginTop: 6,
    fontSize: 12,
    color: palette.accent,
  },
  vehicleCard: {
    marginTop: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.fieldBorder,
    backgroundColor: palette.fieldBg,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  vehicleCardCompact: {
    marginTop: 10,
    borderRadius: 14,
    paddingVertical: 12,
  },
  vehicleLabel: {
    fontSize: 12,
    color: palette.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  vehicleValue: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: "600",
    color: palette.textPrimary,
  },
  vehicleValueCompact: {
    fontSize: 15,
  },
  documentsSection: {
    marginTop: 16,
  },
  documentsSectionCompact: {
    marginTop: 12,
  },
  documentList: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  documentListCompact: {
    marginHorizontal: -2,
  },
  documentListNarrow: {
    justifyContent: "flex-start",
  },
  documentCard: {
    position: "relative",
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: palette.accent,
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 10,
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  documentCardCompact: {
    paddingTop: 8,
    paddingBottom: 6,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: 8,
    minHeight: 40,
  },
  documentCardPhoto: {
    paddingVertical: 16,
    minHeight: 56,
  },
  documentCardPhotoCompact: {
    paddingTop: 14,
    paddingBottom: 12,
    minHeight: 52,
  },
  documentCardHalf: {
    width: "48%",
  },
  documentCardFull: {
    width: "100%",
  },
  documentCardHalfNarrow: {
    width: "100%",
  },
  documentCardPending: {
    borderColor: palette.accent,
  },
  documentCardApproved: {
    borderColor: Colors.success,
  },
  documentCardRejected: {
    borderColor: palette.accent,
  },
  documentCardReviewing: {
    borderColor: "#FF9500",
  },
  documentBadge: {
    position: "absolute",
    top: -9,
    left: 14,
    backgroundColor: palette.screen,
    paddingHorizontal: 6,
  },
  documentBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: palette.accent,
  },
  documentBadgeTextApproved: {
    color: Colors.success,
  },
  documentBadgeTextReviewing: {
    color: "#FF9500",
  },
  documentCardBody: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingRight: 12,
  },
  documentTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#c79191", // default/pending color
    textAlign: "center",
  },
  documentTitleApproved: {
    color: Colors.success,
  },
  documentTitleReviewing: {
    color: "#FF9500",
  },
  documentTitleCompact: {
    fontSize: 14,
  },
  documentIcons: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  documentIconSpacing: {
    marginLeft: 6,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 14,
    backgroundColor: palette.screen,
    borderTopWidth: 1,
    borderColor: "#E3E0EC",
  },
  footerCompact: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  footerButton: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    borderWidth: 1.5,
    borderColor: palette.textPrimary,
    backgroundColor: palette.fieldBg,
    marginRight: 12,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: palette.textPrimary,
  },
  saveButtonActive: {
    backgroundColor: Colors.primary,
  },
  saveButtonDisabled: {
    backgroundColor: palette.saveDisabled,
  },
  saveText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.white,
  },
  saveTextDisabled: {
    color: palette.textSecondary,
  },
  footerButtonCompact: {
    height: 48,
    borderRadius: 14,
  },
  toastContainer: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: "#333",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    zIndex: 9999,
  },
  toastText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 10,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 24,
  },
  plateInput: {
    width: "100%",
    height: 64,
    borderWidth: 2,
    borderColor: "#F0F0F0",
    borderRadius: 16,
    paddingHorizontal: 20,
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    color: "#1A1A1A",
    backgroundColor: "#F9FAFB",
    marginBottom: 32,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 16,
  },
  modalButton: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  modalButtonCancel: {
    backgroundColor: "#F3F4F6",
  },
  modalButtonSubmit: {
    backgroundColor: Colors.primary,
  },
  modalButtonTextCancel: {
    color: "#4B5563",
    fontSize: 16,
    fontWeight: "600",
  },
  modalButtonTextSubmit: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
