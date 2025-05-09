import PopMenu from '@/components/PopMenu';
import { PAGE_INFO } from '@/constants/pageInfo';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PopPage from '../../components/PopPage';
import PostAdd from './postAdd';
const homePage = () => {
    const [postAddVisible, setPostAddVisible] = useState(false);
    const [pageName, setPageName] = useState<keyof typeof PAGE_INFO>('FoundPage'); // 用于存储当前页面名称
    // const [isHome, setIsHome] = React.useState(true); // 用于存储当前页面索引
    let isHome = pageName === 'FoundPage' ? true : false; // 判断当前页面是否是首页

    const handlePageChange = (page: keyof typeof PAGE_INFO) => {
        setPageName(page);
        // setIsHome(page === 'FoundPage'); // 更新当前页面索引
    }

    const pageInfo = PAGE_INFO[pageName] as { component: React.ComponentType };
   
    return (
        <SafeAreaView className='overflow-auto'>
        {/* <SafeAreaView style={{marginTop: Platform.OS=="android"?StatusBar.currentHeight:0, flexDirection:"column"}}> */}
                {/* 这里是顶部导航栏 */}
                <View className='flex top-0 h-12 bg-mySpan ' style={styles.navigator}>
                    <View className='flex flex-row justify-start items-center w-1/3'>
                        {/* 根据当前页面是否是首页，是则这里只显示“个人按钮”，否则反之 */}
                        { isHome? 
                          ( 
                            <Pressable onPress={() => {
                                handlePageChange('FoundPage')
                                // isHome = false
                                }} style={{flexDirection:"row"}}>
                                <Text className='m-2 color-myPriFont'>个人</Text>
                            </Pressable>
                          ) : (
                            <Pressable onPress={() => handlePageChange('FoundPage')} style={{flexDirection:"row"}}>
                                <Text className='m-2 color-myPriFont'>首页</Text>
                            </Pressable>

                          )}
                    </View> 

                    <View className='flex flex-row justify-center items-center w-1/3 bg-mySpan rounded-full m-1.5'>
                        {/* <Text className='m-2 color-myPriFont items-center'>推荐</Text> */}
                        <Pressable onPress={() => handlePageChange('FoundPage')} style={{flexDirection:"row"}}>
                            <Text className='m-2 color-myPriFont'>发现</Text>
                        </Pressable>

                        <Text className='m-2 color-myPriFont'>  </Text>
                        <Pressable onPress={() => handlePageChange('FollowPage')}>
                            <Text className='m-2 color-myPriFont'>关注</Text>
                        </Pressable>
                    </View>


                    <View className='flex flex-row justify-end items-center w-1/3'>
                        <View className='m-2 color-myPriFont'>
                            <Text>搜索</Text>
                        </View>
                        <View className='m-2 color-myPriFont'>
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
                <View className='bg-myBG h-full' style={{marginTop: 0, flexDirection:"column"}}>
                                {'component' in pageInfo ? (
                    React.createElement(pageInfo.component)
                ) : null}
                </View> 

        
                {/* 这里是底部导航栏 */} 
                <View className='absolute bottom-0 w-full bg-myBG items-center mb-12 h-32'>
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
        backgroundColor: '#07070F',// 背景色
        opacity: 1,
        color: '#FFFFFF',// 字体颜色
    },
    customButton: {
      width: 75,
      height: 75,
      borderRadius: 50,          // 圆形按钮
      backgroundColor: '#5E5BE6',// 背景色
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 3,              // Android阴影
      shadowColor: '#000',       // iOS阴影
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
    },
    buttonText: {
      fontSize: 24,
      color: '#FFFFFF',
      fontWeight: 'bold',
    }
  });
  

export default homePage