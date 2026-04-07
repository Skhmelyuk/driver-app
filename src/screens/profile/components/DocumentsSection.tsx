import React, { useMemo } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Colors } from "@/constants/theme";
import { profileStyles as styles } from "@/styles/profile.styles";
import type {
  Driver,
  DriverDocument,
  DriverDocumentStatus,
  DriverDocumentType,
} from "@/types/auth.types";
import type { DocumentCardConfig } from "@/screens/profile/types";
import { formatDateDisplay } from "@/screens/profile/utils";

type DocumentsSectionProps = {
  driver?: Driver | null;
  documents: DriverDocument[];
  uploadingDoc: DriverDocumentType | null;
  isUploading: boolean;
  onUpload: (docType: DriverDocumentType) => void;
  compact?: boolean;
  narrow?: boolean;
};

const BADGE_LABEL: Record<DriverDocumentStatus, string> = {
  pending: "обов'язково",
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
      title: driver?.vehicle_plate ?? "XX 0000 XX",
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
  uploadingDoc,
  isUploading,
  onUpload,
  compact,
  narrow,
}) => {
  const cards = useMemo(() => buildCards(driver), [driver]);

  const getDocumentByType = (type: DriverDocumentType) =>
    documents.find((doc) => doc.doc_type === type);

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
          const status: DriverDocumentStatus = isDoc
            ? (doc?.status ?? "pending")
            : allDocsApproved
              ? "approved"
              : "pending";
          const isApproved = status === "approved";
          const showUploading =
            isDoc && uploadingDoc === card.docType && isUploading;

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
              : status === "rejected"
                ? styles.documentCardRejected
                : styles.documentCardPending,
          ];

          let badgeText = BADGE_LABEL[status];
          if (card.key === "vehicle_photo") {
            badgeText = isApproved ? "перевірено 3 фото" : "обов'язково 3 фото";
          }

          const displayTitle =
            card.kind === "info" && card.value && isApproved
              ? card.value
              : card.title;

          const renderIcons = () => {
            if (showUploading) {
              return <ActivityIndicator size="small" color={Colors.black} />;
            }
            if (isApproved) {
              return (
                <>
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={Colors.success}
                  />
                  {card.kind === "info" && card.icon && (
                    <Ionicons
                      name={card.icon as any}
                      size={20}
                      color={Colors.black}
                      style={styles.documentIconSpacing}
                    />
                  )}
                </>
              );
            }
            if (isDoc) {
              return <Ionicons name="attach" size={24} color={Colors.black} />;
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
                  ]}
                >
                  {badgeText}
                </Text>
              </View>
              <View style={styles.documentCardBody}>
                <Text
                  style={[
                    styles.documentTitle,
                    compact && styles.documentTitleCompact,
                  ]}
                  numberOfLines={2}
                >
                  {displayTitle}
                </Text>
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
                disabled={isUploading}
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
    </View>
  );
};
