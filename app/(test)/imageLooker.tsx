import React, { useState } from 'react';
import {
  Dimensions,
  StyleSheet,
  View
} from 'react-native';
import ImageView from 'react-native-image-viewing';
import Video from 'react-native-video';

const ImageViewer = ({visible, items, index, onClose}: any) => {
  const [currentIndex, setCurrentIndex] = useState(index);

  return (
    <ImageView
      images={items.map((uri: string) => ({uri}))}
      imageIndex={currentIndex}
      visible={visible}
      onRequestClose={onClose}
      FooterComponent={({imageIndex}) => (
        <View style={styles.footer}>
          {items[imageIndex].type === 'video' && (
            <Video
              source={{uri: items[imageIndex].uri}}
              style={styles.video}
              controls={true}
            />
          )}
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  footer: {
    height: 100,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  video: {
    width: Dimensions.get('window').width,
    height: 100,
  },
});

export default ImageViewer;