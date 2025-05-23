import PopMenu from '@/components/PopMenu';
import PopPage from '@/components/PopPage';
import { PAGE_INFO } from '@/constants/pageInfo';
import { useGlobalContext } from '@/context/GlobalContext';
import { logout } from '@/lib/appwrite';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PostAdd from './postAdd';
import SearchPage from './search';
const homePage = () => {
    const [postAddVisible, setPostAddVisible] = useState(false);
    const [searchVisible, setSearchVisible] = useState(false);
    const [pageName, setPageName] = useState<keyof typeof PAGE_INFO>('FoundPage'); // 用于存储当前页面名称
    const {user, refreshUser} = useGlobalContext()
    // const [isHome, setIsHome] = React.useState(true); // 用于存储当前页面索引
    let isHome = pageName === 'FoundPage' ? true : false; // 判断当前页面是否是首页

    const handlePageChange = (page: keyof typeof PAGE_INFO) => {
        setPageName(page);
        // setIsHome(page === 'FoundPage'); // 更新当前页面索引
    }
    const handleLogout = async () => {
        console.log("用户退出登入....");
        await logout()
        router.push({ pathname: '/(auth)/loginUser' })
        refreshUser()
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
                                handlePageChange('ProfilePage') 
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
                        <Pressable className='mr-16' onPress={() => handlePageChange('FoundPage')} style={{flexDirection:"column", alignItems:"center"}}>
                            <Text className='mt-4 color-myPriFont'>发现</Text>
                            <Text style={{borderTopWidth:1, borderColor:"#5E5BE6", opacity: pageName === 'FoundPage' ? 1 : 0 }}>         </Text>
                        </Pressable>

                        <Text className='color-myPriFont'></Text>
                        <Pressable className='mr-2' onPress={() => handlePageChange('FollowPage')} style={{flexDirection:"column", alignItems:"center"}}>
                            <Text className='mt-4 color-myPriFont'>关注</Text>
                            <Text style={{borderTopWidth:1, borderColor:"#5E5BE6", opacity: pageName === 'FollowPage' ? 1 : 0}}>         </Text>
                        </Pressable>
                    </View>


                    <View className='flex flex-row justify-end items-center w-1/3'>
                        <View className='m-2 color-myPriFont'>
                            <TouchableOpacity className='w-12 h-7 bg-mySpan color-myPriFont rounded-full items-center justify-cneter' onPress={() => {setSearchVisible(true)}}>
                                <Text className='mt-0.5 text-bold text-myPriFont'>搜索</Text>
                                <PopPage
                                    visible={searchVisible}
                                    onClose={() => setSearchVisible(false)}
                                    height="980"
                                    contentComponent={<SearchPage />}
                                />        
                            </TouchableOpacity>  
                        </View>
                        {/* <BlurView className='m-2 color-myPriFont rounded-full m-1.5'
                            intensity={50}
                            tint="light" // 模糊叠加红色透明层
                            style={{ borderRadius: 600, justifyContent: 'flex-start', alignItems: 'center' }}
                        > */}
                            <View className='m-2 h-7 bg-mySpan color-myPriFont rounded-full mr-4'>
                                <PopMenu
                                    options={[
                                        { label: '账户设置', onPress: () => console.log('Edit1') },
                                        // { label: '夜间模式', onPress: () => console.log('Share') },
                                        // { label: '日间模式', onPress: () => console.log('Delete') },
                                        { label: '浏览记录', onPress: () => console.log('Report') },
                                        { label: '退出登入', onPress: () => handleLogout() },
                                    ]}
                                    triggerStyle={{ backgroundColor: 'red' }}
                                    menuWidth={200}
                                />
                            </View>
                        {/* </BlurView> */}
                    </View>
                    
                </View> 
                
                {/* 这里是中部内容栏 */} 
                <View className='bg-myBG h-full' style={{marginTop: 0, flexDirection:"column"}}>
                                {'component' in pageInfo ? (
                    React.createElement(pageInfo.component)
                ) : null}
                </View> 

        
                {/* 这里是底部导航栏 */}  
                    <BlurView className='absolute bottom-0 w-full bg-myBG items-center mb-12 h-32'
                            intensity={60}
                            tint="dark" // 模糊叠加红色透明层
                    >
                    
                            <TouchableOpacity style={styles.customButton} onPress={() => {setPostAddVisible(true)}}>
                                <Text style={styles.buttonText}>+</Text>
                                <PopPage
                                    visible={postAddVisible}
                                    onClose={() => setPostAddVisible(false)}
                                    height="980"
                                    contentComponent={<PostAdd />}
                                />        
                            </TouchableOpacity> 
                    
                    
                    </BlurView>   
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
    },
    underline: {
      height: 2,
      backgroundColor: '#3b82f6',
      width: 0,
    },
  });
  

export default homePage