import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import AlbumPicker, { MediaAsset } from './Album';
import Bookshelf from './bookshelf';

const TestScreen = () => {
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [showAlbum, setShowAlbum] = useState(false);
  // const [mediaList, setMediaList] = useState<MediaAsset[]>([]);

  const handleSelectMedia = (assets: MediaAsset[], isEnd: boolean) => {
    setMediaAssets(assets);
    if(isEnd) setShowAlbum(false); 
    
  };

  // const handleSwap = (fromIndex: number, toIndex: number) => {
  //   const newList = [...mediaList];
  //   [newList[fromIndex], newList[toIndex]] = [newList[toIndex], newList[fromIndex]];
  //   setMediaList(newList);
  // };

  return (
    <View style={styles.container}>
      <Bookshelf assets={mediaAssets}
                //  onSwap={handleSwap} 
      />
      
      <View style={styles.buttonContainer}>
        <Pressable 
          onPress={() => setShowAlbum(true)}
          style={styles.button}
        >
            <Text>选择相册</Text>
        </Pressable>
      </View>

      {showAlbum && (
        <AlbumPicker
          onConfirm={handleSelectMedia}
          onCancel={() => setShowAlbum(false)}
          maxSelection={13}
          live={true}
          currentAssets={mediaAssets}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center'
  },
  button: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8
  }
});

export default TestScreen;