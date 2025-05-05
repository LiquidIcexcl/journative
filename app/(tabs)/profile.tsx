import { useGlobalContext } from '@/context/GlobalContext'
import { logout } from '@/lib/appwrite'
import { Link } from 'expo-router'
import React from 'react'
import { Image, Platform, Pressable, SafeAreaView, StatusBar, Text, View } from 'react-native'

const profile = () => {
  const {user, refreshUser} = useGlobalContext()

  const handleLogout = async () => {
    await logout()
    refreshUser()
  }

  return (
    <SafeAreaView className='flex-1 bg-myBackGround' style={{marginTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0}}>
      <View className='flex-1 flex-col items-center'>

        <View className='flex-row gap-2 items-center justify-center'>
          {user?.avatarUrl ? (
            <Image source={{uri: user?.avatarUrl}} className='w-12 h-12 rounded-full' />
          ): (
            <></>
          )}
          <Text className='text-2xl font-bold'>
            {user?.name}
          </Text>
        </View>

        <Link href='/sign_in' className='p-4 rounded-lg w-full'>
          <Text className='text-center font-semibold text-lg'>
            登录
          </Text>
        </Link>

        <Link href='/sign_up' className='p-4 rounded-lg w-full'>
          <Text className='text-center font-semibold text-lg'>
            注册
          </Text>
        </Link>

        <Pressable
          className='p-4 rounded-lg w-full'
          onPress={handleLogout}
        >
          <Text className='text-center font-semibold text-lg'>
            退出登录
          </Text>
        </Pressable>

      </View>
    </SafeAreaView>
  )
}

export default profile