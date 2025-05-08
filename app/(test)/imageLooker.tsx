import React from 'react';
import { Animated, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import type { MediaAsset } from './Album';

const ImageLooker = ({
  asset,
  panHandlers,
  isDragging,
  dragPosition
}: {
  asset: MediaAsset;
  panHandlers: any;
  isDragging: boolean;
  dragPosition: Animated.ValueXY;
}) => {
  const animatedStyle = {
    transform: dragPosition.getTranslateTransform(),
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 999 : 1,
  };

  return (
    <Animated.View
      {...panHandlers}
      style={[styles.container, animatedStyle]}
    >
      <TouchableWithoutFeedback>
        <Animated.Image
          source={{ uri: asset.uri }}
          style={styles.image}
          resizeMode="cover"
        />
      </TouchableWithoutFeedback>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  image: {
    flex: 1,
    borderRadius: 4,
  },
});

export default ImageLooker;