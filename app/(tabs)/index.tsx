import React from 'react';
import { Platform, SafeAreaView, StatusBar, StyleSheet } from 'react-native';

import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import Index_all from './index_all';
import Index_follow from './index_follow';

const Tab = createMaterialTopTabNavigator();

export default function HomeScreen() {
  return (
    <SafeAreaView className='flex-1 bg-myWhite' style={styleSheet.container}>
      <Tab.Navigator
        screenOptions={{
          tabBarIndicatorStyle: {
            backgroundColor: '#98D98E',
          },
          
        }}
      >
        <Tab.Screen name="发现" component={Index_all} />
        <Tab.Screen name="关注" component={Index_follow} />
      </Tab.Navigator>
    </SafeAreaView>
  );
}

const styleSheet = StyleSheet.create({
  container: {
    marginTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
    height: 44,
    elevation: 0,
    backgroundColor: '#fff',
    flex: 1,
    borderBottomWidth: 0
  }
})