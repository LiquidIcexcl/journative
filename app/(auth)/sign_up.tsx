import { useGlobalContext } from '@/context/GlobalContext'
import { register } from '@/lib/appwrite'
import { Link, router } from 'expo-router'
import React, { useState } from 'react'
import { Alert, Pressable, SafeAreaView, Text, TextInput, View } from 'react-native'

const sign_up = () => {
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
            console.log(error)
            Alert.alert('注册失败', '请检查邮箱和密码')
            setLoading(false)
        }
    }


    return (
        <SafeAreaView className='flex-1 bg-myBackGround'>
            <View className='flex-1 flex-col mx-2'>

                <Text className='text-2xl font-bold text-myGreen text-center mt-20'>注册</Text>

                <TextInput
                    placeholder='Email'
                    value={email}
                    onChangeText={setEmail}
                    className='border border-myGreen rounded-md p-2 mt-6 h-12'
                />

                <TextInput
                    placeholder='Username'
                    value={username}
                    onChangeText={setUsername}
                    className='border border-myGreen rounded-md p-2 mt-6 h-12'
                />

                <TextInput
                    placeholder='Password'
                    value={password}
                    onChangeText={setPassword}
                    className='border border-myGreen rounded-md p-2 mt-6 h-12'
                    secureTextEntry={true}
                />

                <Pressable
                    className='bg-myGreen rounded-md p-2 mt-6 h-12 flex items-center justify-center'
                    onPress={handleSignUp}
                >
                    <Text className='text-white text-center font-semibold text-lg'>{loading ? '注册中...' : '注册'}</Text>
                </Pressable>

                <View className='flex-row justify-center mt-4'>
                    <Text className=''>已有账号？ </Text>
                    <Link href='/sign_in' className='text-myGreen'>登录</Link>
                </View>

            </View>

        </SafeAreaView>
    )
}

export default sign_up