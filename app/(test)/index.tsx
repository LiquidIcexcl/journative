import React, { useState } from 'react';
import { Button, StyleSheet, View } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import Bookshelf from './bookshelf';

const Test = () => {
  const [mediaItems, setMediaItems] = useState<string[]>([]);

  const selectMedia = async () => {
    const result = await launchImageLibrary({
      mediaType: 'mixed',
      selectionLimit: 14,
      includeBase64: false,
    });

    if (result.assets) {
      setMediaItems(result.assets.map(asset => asset.uri || ''));
    }
  };

  return (
    <View style={styles.container}>
      <Bookshelf items={mediaItems} />
      <View style={styles.buttonContainer}>
        <Button title="选择媒体" onPress={selectMedia} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
  },
});

export default Test;