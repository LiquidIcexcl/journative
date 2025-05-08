import React, { useState } from 'react';
import { Alert, Button, StyleSheet, View } from 'react-native';
import AlbumPicker, { MediaAsset } from './Album';

const TestPage = () => {
  const [showAlbum, setShowAlbum] = useState(false);

  const handleSelected = (assets: MediaAsset[]) => {
    setShowAlbum(false);
    Alert.alert(
      'Selected Media',
      assets.map(a => `${a.filename} (${a.index})`).join('\n')
    );
  };

  return (
    <View style={styles.container}>
      {!showAlbum && (
        <Button
          title="Open Album Picker"
          onPress={() => setShowAlbum(true)}
        />
      )}
      {showAlbum && (
        <AlbumPicker
          onCancel={() => setShowAlbum(false)}
          onConfirm={handleSelected}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16
  }
});

export default TestPage;