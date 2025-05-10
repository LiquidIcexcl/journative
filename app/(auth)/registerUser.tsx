import { useGlobalContext } from '@/context/GlobalContext'
import { register } from '@/lib/appwrite'
import { Link, router } from 'expo-router'
import React, { useState } from 'react'
import { Alert, Pressable, SafeAreaView, Text, TextInput, View } from 'react-native'

const registerUser = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [username, setUsername] = useState('')
    const [loading, setLoading] = useState(false)

    const {refreshUser} = useGlobalContext()

    const handleSignUp = async () => {
        try {
            setLoading(true)
            await register(email, password, username)
            setLoading(false)
            router.push('/')
            refreshUser()
        } catch (error) {
            console.log('注册失败');
            console.log(error)
            Alert.alert('注册失败', '请检查邮箱和密码')
            setLoading(false)
        }
    }


    return (
        <SafeAreaView className='flex-1 bg-myBG'>
            <View className='flex-1 flex-col mx-2 mt-64'>

                <Text className='text-3xl font-bold text-myPriFont text-center mb-10'>注册</Text>

                <TextInput
                    placeholder='使用你的邮箱注册'
                    placeholderTextColor={'#FFFFFF'}
                    value={email}
                    onChangeText={setEmail}
                    className='border text-myPriFont border-myButton rounded-md p-2 mt-6 h-12'
                />

                <TextInput
                    placeholder='输入你的用户名'
                    placeholderTextColor={'#FFFFFF'}
                    value={username}
                    onChangeText={setUsername}
                    className='border text-myPriFont border-myButton rounded-md p-2 mt-6 h-12'
                />

                <TextInput
                    placeholder='请输入你的密码'
                    value={password}
                    placeholderTextColor={'#FFFFFF'}
                    onChangeText={setPassword}
                    className='border text-myPriFont border-myButton rounded-md p-2 mt-6 h-12'
                    secureTextEntry={true}
                />

                <Pressable
                    className='bg-myButton rounded-md p-2 mt-6 h-12 flex items-center justify-center'
                    onPress={handleSignUp}
                >
                    <Text className='text-myPriFont text-center font-semibold text-lg'>{loading ? '注册中...' : '注册'}</Text>
                </Pressable>

                <View className='flex-row justify-center mt-4'>
                    <Text className='text-myPriFont'>已有账号？ </Text>
                    <Link href='/loginUser' className='text-myButton'>登录</Link>
                </View>

            </View>

        </SafeAreaView>
    )
}

export default registerUser