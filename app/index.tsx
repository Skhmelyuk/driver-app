import { Text, View, StyleSheet } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";

export default function Index() {
  return (
    <View style={styles.container}>
      <View style={styles.text}>
        <Text>Edit app/index.tsx to edit this screen.</Text>
        <AntDesign name="arrow-right" size={20} color="red" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#333",
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
  },
});
