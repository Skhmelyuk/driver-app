import React, { memo } from "react";
import { Controller, Control, FieldErrors } from "react-hook-form";
import { Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Colors } from "@/constants/theme";
import { profileStyles as styles } from "@/styles/profile.styles";
import type { ProfileFormValues } from "@/screens/profile/types";
import {
  maskDateInput,
  stripPhoneToNineDigits,
  formatPhoneDisplay,
} from "@/screens/profile/utils";

export type PersonalInfoFormProps = {
  control: Control<ProfileFormValues>;
  errors: FieldErrors<ProfileFormValues>;
  phonePrefix: string;
  compact?: boolean;
  narrow?: boolean;
};

const PersonalInfoFormComponent: React.FC<PersonalInfoFormProps> = ({
  control,
  errors,
  phonePrefix,
  compact,
  narrow,
}) => (
  <View
    style={[
      styles.formSection,
      compact && styles.formSectionCompact,
      narrow && styles.formSectionNarrow,
    ]}
  >
    <View style={[styles.nameRow, (narrow || compact) && styles.nameRowStack]}>
      <View
        style={[styles.nameField, (narrow || compact) && styles.nameFieldFull]}
      >
        <Controller
          control={control}
          name="lastName"
          rules={{ required: "Вкажіть прізвище" }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[
                styles.field,
                compact && styles.fieldCompact,
                errors.lastName && styles.fieldError,
              ]}
              placeholder="Когут"
              placeholderTextColor={Colors.gray}
              value={value}
              onChangeText={onChange}
            />
          )}
        />
        {errors.lastName ? (
          <Text style={styles.errorText}>{errors.lastName.message}</Text>
        ) : null}
      </View>
      <View
        style={[
          styles.nameField,
          !narrow && !compact && styles.nameFieldSpacing,
          (narrow || compact) && styles.nameFieldFull,
          (narrow || compact) && styles.nameFieldStacked,
        ]}
      >
        <Controller
          control={control}
          name="firstName"
          rules={{ required: "Вкажіть ім'я" }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[
                styles.field,
                compact && styles.fieldCompact,
                errors.firstName && styles.fieldError,
              ]}
              placeholder="Ігор"
              placeholderTextColor={Colors.gray}
              value={value}
              onChangeText={onChange}
            />
          )}
        />
        {errors.firstName ? (
          <Text style={styles.errorText}>{errors.firstName.message}</Text>
        ) : null}
      </View>
    </View>

    <View style={[styles.phoneRow, compact && styles.phoneRowCompact]}>
      <View
        style={[
          styles.phoneContainer,
          compact && styles.phoneContainerCompact,
          errors.phoneNumber && styles.phoneContainerError,
        ]}
      >
        <View
          style={[styles.phonePrefix, compact && styles.phonePrefixCompact]}
        >
          <Text style={styles.phonePrefixText}>{phonePrefix}</Text>
        </View>
        <Controller
          control={control}
          name="phoneNumber"
          rules={{
            required: "Вкажіть номер",
            validate: (val) =>
              stripPhoneToNineDigits(val).length === 9 || "Вкажіть 9 цифр",
          }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[styles.phoneInput, compact && styles.phoneInputCompact]}
              keyboardType="phone-pad"
              placeholder="050 000 20 25"
              placeholderTextColor={Colors.gray}
              value={value}
              onChangeText={(text) => {
                const digits = stripPhoneToNineDigits(text);
                onChange(formatPhoneDisplay(digits));
              }}
            />
          )}
        />
      </View>
    </View>
    {errors.phoneNumber ? (
      <Text style={styles.errorText}>{errors.phoneNumber.message}</Text>
    ) : null}

    <View style={[styles.dateFieldWrapper, compact && styles.phoneRowCompact]}>
      <Controller
        control={control}
        name="dateOfBirth"
        render={({ field: { onChange, value } }) => (
          <View
            style={[
              styles.dateField,
              compact && styles.dateFieldCompact,
              errors.dateOfBirth && styles.fieldError,
            ]}
          >
            <TextInput
              style={{
                flex: 1,
                fontSize: compact ? 15 : 16,
                color: Colors.black,
              }}
              placeholder="Дата народження"
              placeholderTextColor={Colors.gray}
              keyboardType="number-pad"
              value={value}
              onChangeText={(text) => onChange(maskDateInput(text))}
            />
            <Ionicons
              name="chevron-down"
              size={18}
              color="#8C88A3"
              style={styles.dateChevron}
            />
          </View>
        )}
      />
      {errors.dateOfBirth ? (
        <Text style={styles.errorText}>{errors.dateOfBirth.message}</Text>
      ) : null}
    </View>
  </View>
);

export const PersonalInfoForm = memo(PersonalInfoFormComponent);

export default PersonalInfoForm;
