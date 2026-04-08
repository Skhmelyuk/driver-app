import type { DriverDocumentType } from "@/types/auth.types";

export type ProfileFormValues = {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  dateOfBirth: string;
  profileImage: string;
  licenseExpiry: string;
  vehiclePlate: string;
};

export type DocumentCardLayout = "half" | "full";

export type DocumentCardBase = {
  key: string;
  layout: DocumentCardLayout;
  title: string;
  description?: string;
};

export type DocumentInfoCard = DocumentCardBase & {
  kind: "info";
  value?: string;
  icon?: string;
};

export type DocumentUploadCard = DocumentCardBase & {
  kind: "doc";
  docType: DriverDocumentType;
};

export type DocumentCardConfig = DocumentInfoCard | DocumentUploadCard;
