import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const Hello = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Hello from Popup!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default Hello;