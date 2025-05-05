import React, { useState } from 'react';
import { Button, StyleSheet, View } from 'react-native';
import Hello from './hello'; // 假设这是你的hello.tsx组件
import PopPage from './popPage';

const Test_PopPage = () => {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.container}>
      <Button title="打开弹出页" onPress={() => setVisible(true)} />
      
      <PopPage
        visible={visible}
        onClose={() => setVisible(false)}
        height="400"
        contentComponent={<Hello />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Test_PopPage;