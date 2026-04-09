import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet } from "react-native";

export const RadarPulse = ({ isOnline }: { isOnline: boolean }) => {
  const anim1 = useRef(new Animated.Value(0)).current;
  const anim2 = useRef(new Animated.Value(0)).current;
  const anim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isOnline) {
      anim1.stopAnimation();
      anim2.stopAnimation();
      anim3.stopAnimation();
      return;
    }

    const createAnimation = (animValue: Animated.Value, delay: number) => {
      animValue.setValue(0);
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animValue, {
            toValue: 1,
            duration: 3500, // Плавна 3.5 секунди анімація
            useNativeDriver: false, // false forces layout update for react-native-maps static bitmaps
          }),
        ])
      );
    };

    createAnimation(anim1, 0).start();
    createAnimation(anim2, 1000).start();
    createAnimation(anim3, 2000).start();

    return () => {
      anim1.stopAnimation();
      anim2.stopAnimation();
      anim3.stopAnimation();
    };
  }, [isOnline]);

  if (!isOnline) return <View style={{ width: 1, height: 1, backgroundColor: "transparent" }} />;

  const renderCircle = (animValue: Animated.Value) => {
    const scale = animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    const opacity = animValue.interpolate({
      inputRange: [0, 0.2, 0.8, 1],
      outputRange: [0, 0.8, 0, 0], // З'являється плавно і розчиняється
    });

    return (
      <Animated.View
        style={[
          styles.circle,
          {
            transform: [{ scale }],
            opacity: opacity,
          },
        ]}
      />
    );
  };

  return (
    <View style={styles.container}>
      {renderCircle(anim1)}
      {renderCircle(anim2)}
      {renderCircle(anim3)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 250,
    height: 250,
    alignItems: "center",
    justifyContent: "center",
  },
  circle: {
    position: "absolute",
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "rgba(119, 0, 246, 0.12)", // Напівпрозорий фіолетовий (PRIMARY)
  },
});
