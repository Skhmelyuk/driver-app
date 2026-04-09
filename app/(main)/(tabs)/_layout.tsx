import React from "react";
import { Tabs } from "expo-router";
import { CustomTabBar } from "@/components/navigation/CustomTabBar";

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" options={{ title: "Головна" }} />
      <Tabs.Screen name="rating" options={{ title: "Рейтинг" }} />
      <Tabs.Screen name="wallet" options={{ title: "Гаманець" }} />
    </Tabs>
  );
}
