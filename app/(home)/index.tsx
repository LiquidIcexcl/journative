import PopMenu from '@/components/PopMenu';
import { PAGE_INFO } from '@/constants/pageInfo';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import React, { JSX, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PopPage from '../(test)/popPage';
import PostAdd from './postAdd';
const Tab = createMaterialTopTabNavigator(); 
const homePage = () => {
    const [postAddVisible, setPostAddVisible] = useState(false);
    const [pageName, setPageName] = React.useState<keyof typeof PAGE_INFO>('FoundPage'); // 用于存储当前页面名称
    return (
        <SafeAreaView className='overflow-auto'>
        {/* <SafeAreaView style={{marginTop: Platform.OS=="android"?StatusBar.currentHeight:0, flexDirection:"column"}}> */}
                {/* 这里是顶部导航栏 */}
                <View className='flex top-0 h-12 bg-myBackGround' style={styles.navigator}>
                    <View className='flex flex-row justify-start items-center w-1/3'>
                        <Text className='m-2'>首页1</Text> 
                        <Text className='m-2'>个人</Text>
                    </View> 

                    <View className='flex flex-row justify-center items-center w-1/3 bg-gray-500/50'>
                        <Text className='m-2'>推荐</Text>
                        <Text className='m-2'>关注</Text>
                    </View>


                    <View className='flex flex-row justify-end items-center w-1/3'>
                        <View className='m-2'>
                            <Text>搜索</Text>
                        </View>
                        <View className='m-2'>
                            <PopMenu
                                options={[
                                    { label: '账户1设置', onPress: () => console.log('Edit1') },
                                    { label: '夜间模式', onPress: () => console.log('Share') },
                                    { label: '日间模式', onPress: () => console.log('Delete') },
                                    { label: '浏览记录', onPress: () => console.log('Report') },
                                ]}
                                triggerStyle={{ backgroundColor: 'red' }}
                                menuWidth={200}
                            />
                        </View>
                    </View>
                    
                </View> 
                
                {/* 这里是中部内容栏 */} 
                <View className='bg-myBackGround h-full' style={{marginTop: 0, flexDirection:"column"}}>
                    {'component' in (PAGE_INFO[pageName] as { component: () => JSX.Element }) ? (PAGE_INFO[pageName] as { component: () => JSX.Element }).component() : null}
                </View> 

        
                {/* 这里是底部导航栏 */} 
                <View className='absolute bottom-0 w-full bg-myBackGround items-center mb-24' >
                    <TouchableOpacity style={styles.customButton} onPress={() => {setPostAddVisible(true)}}>
                        <Text style={styles.buttonText}>+</Text>
                        <PopPage
                            visible={postAddVisible}
                            onClose={() => setPostAddVisible(false)}
                            height="800"
                            contentComponent={<PostAdd />}
                        />        
                    </TouchableOpacity>
                </View>  
        </SafeAreaView>
    )
    }

const styles = StyleSheet.create({
    navigator: {
        marginTop: 0, 
        flexDirection:"row",
        backgroundColor: 'green',// 背景色
        opacity: 1,
    },
    customButton: {
      width: 75,
      height: 75,
      borderRadius: 50,          // 圆形按钮
      backgroundColor: 'blue',// 背景色
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 3,              // Android阴影
      shadowColor: '#000',       // iOS阴影
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
    },
    buttonText: {
      fontSize: 24,
      color: 'white',
      fontWeight: 'bold',
    }
  });
  

export default homePage