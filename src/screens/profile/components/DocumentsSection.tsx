import React, { useMemo } from "react";
import { Text, TouchableOpacity, View, Platform, Modal, TextInput, Pressable, StyleSheet, KeyboardAvoidingView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CheckmarkIcon } from "@/components/icons/CheckmarkIcon";
import { AttachIcon } from "@/components/icons/AttachIcon";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useFormContext, useWatch } from "react-hook-form";

import { Colors } from "@/constants/theme";
import { profileStyles as styles } from "@/styles/profile.styles";
import type {
  Driver,
  DriverDocument,
  DriverDocumentStatus,
  DriverDocumentType,
} from "@/types/auth.types";
import type { DocumentCardConfig, DocumentInfoCard, ProfileFormValues } from "@/screens/profile/types";
import { formatDateDisplay } from "@/screens/profile/utils";

type DocumentsSectionProps = {
  driver?: Driver | null;
  documents: DriverDocument[];
  onUpload: (docType: DriverDocumentType) => void;
  pendingDocuments?: Partial<Record<DriverDocumentType, boolean>>;
  disableInteractions?: boolean;
  compact?: boolean;
  narrow?: boolean;
};

const BADGE_LABEL: Record<string, string> = {
  pending: "обов'язково",
  reviewing: "на перевірці",
  approved: "перевірено",
  rejected: "оновити",
};

function buildCards(driver?: Driver | null): DocumentCardConfig[] {
  return [
    {
      key: "driver_license",
      layout: "half",
      kind: "doc",
      docType: "driver_license",
      title: "Водійське посвідчення",
    },
    {
      key: "license_expiry",
      layout: "half",
      kind: "info",
      title: "Термін дії",
      value: formatDateDisplay(driver?.license_expiry) || undefined,
      icon: "create-outline",
    },
    {
      key: "vehicle_registration",
      layout: "full",
      kind: "doc",
      docType: "vehicle_registration",
      title: "Техпаспорт авто",
    },
    {
      key: "vehicle_plate",
      layout: "half",
      kind: "info",
      title: "Номер авто",
    },
    {
      key: "insurance_policy",
      layout: "half",
      kind: "doc",
      docType: "insurance_policy",
      title: "Страховий поліс",
    },
    {
      key: "vehicle_photo",
      layout: "full",
      kind: "doc",
      docType: "vehicle_photo",
      title: "Фото Автомобіля",
    },
  ];
}

export const DocumentsSection: React.FC<DocumentsSectionProps> = ({
  driver,
  documents,
  onUpload,
  pendingDocuments,
  disableInteractions,
  compact,
  narrow,
}) => {
  const { control, setValue } = useFormContext<ProfileFormValues>();
  const [showExpiryPicker, setShowExpiryPicker] = React.useState(false);
  
  const licenseExpiryValue = useWatch({
    control,
    name: "licenseExpiry",
  });
  const vehiclePlateValue = useWatch({
    control,
    name: "vehiclePlate",
  });

  const [showPlateModal, setShowPlateModal] = React.useState(false);
  const [plateInputValue, setPlateInputValue] = React.useState("");

  const cards = useMemo(() => buildCards(driver), [driver]);

  const getDocumentByType = (type: DriverDocumentType) =>
    documents.find((doc) => doc.doc_type === type);

  // ... (allDocsApproved, onExpiryChange, parseDate)
  
  const onCardPress = (card: DocumentCardConfig) => {
    // if (disableInteractions) return;
    if (card.key === "license_expiry") {
      setShowExpiryPicker(true);
    } else if (card.key === "vehicle_plate") {
      setPlateInputValue(vehiclePlateValue || "");
      setShowPlateModal(true);
    }
  };

  const onPlateSubmit = () => {
    setValue("vehiclePlate", plateInputValue.toUpperCase(), { shouldDirty: true });
    setShowPlateModal(false);
  };

  const allDocsApproved = useMemo(() => {
    const docTypes: DriverDocumentType[] = [
      "driver_license",
      "vehicle_registration",
      "insurance_policy",
      "vehicle_photo",
    ];
    return docTypes.every((dt) => {
      const doc = documents.find((d) => d.doc_type === dt);
      return doc?.status === "approved";
    });
  }, [documents]);

  const onExpiryChange = (event: DateTimePickerEvent, date?: Date) => {
    setShowExpiryPicker(false);
    if (date) {
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      setValue("licenseExpiry", `${day}.${month}.${year}`, { shouldDirty: true });
    }
  };

  const parseDate = (dateStr: string) => {
    if (!dateStr) return new Date();
    const [d, m, y] = dateStr.split(".");
    if (d && m && y && y.length === 4) {
      return new Date(Number(y), Number(m) - 1, Number(d));
    }
    return new Date();
  };

  return (
    <View
      style={[
        styles.documentsSection,
        compact && styles.documentsSectionCompact,
      ]}
    >
      <View
        style={[
          styles.documentList,
          compact && styles.documentListCompact,
          narrow && styles.documentListNarrow,
        ]}
      >
        {cards.map((card) => {
          const isDoc = card.kind === "doc";
          const doc = isDoc ? getDocumentByType(card.docType) : undefined;
          
          let status: string;
          if (isDoc) {
             const isLocallyPending = Boolean(pendingDocuments?.[card.docType]);
             if (isLocallyPending) {
                status = "pending";
             } else if (doc) {
                status = doc.status === "pending" ? "reviewing" : doc.status;
             } else {
                status = "pending";
             }
          } else if (card.key === "license_expiry") {
             const licenseDoc = getDocumentByType("driver_license");
             if (licenseDoc?.status === "approved") {
                status = "approved";
             } else if (licenseDoc?.status === "pending") {
                status = "reviewing";
             } else {
                status = "pending";
             }
          } else if (card.key === "vehicle_plate") {
             const regDoc = getDocumentByType("vehicle_registration");
             if (regDoc?.status === "approved") {
                status = "approved";
             } else if (regDoc?.status === "pending") {
                status = "reviewing";
             } else {
                status = "pending";
             }
          } else {
             status = allDocsApproved ? "approved" : "pending";
          }

          const isApproved = status === "approved";
          const isReviewing = status === "reviewing";
          const showPendingUpload = isDoc && Boolean(pendingDocuments?.[card.docType]);

          const cardStyle = [
            styles.documentCard,
            compact && styles.documentCardCompact,
            card.layout === "half"
              ? narrow
                ? styles.documentCardHalfNarrow
                : styles.documentCardHalf
              : styles.documentCardFull,
            isApproved
              ? styles.documentCardApproved
              : isReviewing
                ? styles.documentCardReviewing
                : status === "rejected"
                  ? styles.documentCardRejected
                  : styles.documentCardPending,
            card.key === "vehicle_photo" && styles.documentCardPhoto,
            card.key === "vehicle_photo" && compact && styles.documentCardPhotoCompact,
          ];

          let badgeText = BADGE_LABEL[status];
          if (card.key === "vehicle_photo") {
            badgeText = isApproved ? "перевірено 3 фото" : "обов'язково 3 фото";
          }
          if (showPendingUpload) {
            badgeText = "очікує збереження";
          }

          let displayTitle: string = card.title;
          if (card.key === "license_expiry") {
             const infoCard = card as DocumentInfoCard;
             displayTitle = licenseExpiryValue || infoCard.value || card.title;
          } else if (card.key === "vehicle_plate") {
             displayTitle = vehiclePlateValue || card.title;
          } else if (card.kind === "info" && isApproved) {
             const infoCard = card as DocumentInfoCard;
             displayTitle = infoCard.value || card.title;
          }

          const renderIcons = () => {
             const iconColor = isApproved 
                ? Colors.success 
                : isReviewing 
                   ? "#FF9500" 
                   : Colors.black;

            if (isApproved || isReviewing) {
              return (
                <>
                  {isApproved && card.key !== "license_expiry" && card.key !== "vehicle_plate" && (
                    <CheckmarkIcon size={24} />
                  )}
                  {(card.key === "license_expiry" || card.key === "vehicle_plate") && (
                    <Ionicons
                      name="create-outline"
                      size={20}
                      color={iconColor}
                      style={styles.documentIconSpacing}
                    />
                  )}
                </>
              );
            }
            if (showPendingUpload) {
              return (
                <Ionicons
                  name="cloud-upload-outline"
                  size={24}
                  color={Colors.black}
                />
              );
            }
            if (isDoc) {
              return <AttachIcon size={24} />;
            }
            if (card.kind === "info" && card.icon) {
              return (
                <Ionicons
                  name={card.icon as any}
                  size={20}
                  color={Colors.black}
                />
              );
            }
            return null;
          };

          const content = (
            <>
              <View style={styles.documentBadge}>
                <Text
                  style={[
                    styles.documentBadgeText,
                    isApproved && styles.documentBadgeTextApproved,
                    isReviewing && styles.documentBadgeTextReviewing,
                  ]}
                >
                  {badgeText}
                </Text>
              </View>
              <View style={styles.documentCardBody}>
                {card.key === "vehicle_plate" ? (
                  <TextInput
                    style={[
                      styles.documentTitle,
                      compact && styles.documentTitleCompact,
                      isReviewing && styles.documentTitleReviewing,
                      isApproved && { color: Colors.success },
                      { minWidth: 100 }
                    ]}
                    value={vehiclePlateValue}
                    onChangeText={(val) => setValue("vehiclePlate", val.toUpperCase(), { shouldDirty: true })}
                    placeholder="Номер авто"
                    placeholderTextColor={isReviewing ? "rgba(255, 149, 0, 0.5)" : "#999"}
                    autoCapitalize="characters"
                    editable={!disableInteractions}
                  />
                ) : (
                  <Text
                    style={[
                      styles.documentTitle,
                      compact && styles.documentTitleCompact,
                      isApproved && styles.documentTitleApproved,
                      isReviewing && styles.documentTitleReviewing,
                    ]}
                    numberOfLines={2}
                  >
                    {displayTitle}
                  </Text>
                )}
              </View>
              <View style={styles.documentIcons}>{renderIcons()}</View>
            </>
          );

          if (isDoc) {
            return (
              <TouchableOpacity
                key={card.key}
                activeOpacity={0.85}
                style={cardStyle}
                onPress={() => onUpload(card.docType)}
                disabled={Boolean(disableInteractions)}
              >
                {content}
              </TouchableOpacity>
            );
          }

          if (card.key === "license_expiry") {
             return (
               <TouchableOpacity
                 key={card.key}
                 activeOpacity={0.85}
                 style={cardStyle}
                 onPress={() => setShowExpiryPicker(true)}
                 disabled={Boolean(disableInteractions)}
               >
                 {content}
               </TouchableOpacity>
             );
          }

          return (
            <View key={card.key} style={cardStyle}>
              {content}
            </View>
          );
        })}
      </View>
      {showExpiryPicker && (
         <DateTimePicker
           value={parseDate(licenseExpiryValue)}
           mode="date"
           display={Platform.OS === "ios" ? "spinner" : "default"}
           onChange={onExpiryChange}
           minimumDate={new Date()}
         />
      )}
    </View>
  );
};

export default DocumentsSection;
