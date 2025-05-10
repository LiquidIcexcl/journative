import { useGlobalContext } from '@/context/GlobalContext'
import { login } from '@/lib/appwrite'
import { Link, router } from 'expo-router'
import React, { useState } from 'react'
import { Alert, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native'

const loginUser = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)

    const {refreshUser} = useGlobalContext()

    const handleSignIn = async () => { 
        try {  
            setLoading(true)
            await login(email, password)
            setLoading(false)
            router.push({ pathname: '/' })
            refreshUser()
        } catch (error) {
            console.log('登录失败');
            console.log(error)
            Alert.alert('登录失败', '请检查邮箱和密码')
            setLoading(false)
        }
    }


    return (
        <SafeAreaView className='flex-1 bg-myBG'>
            <View className='flex-1 flex-col mx-2 mt-64'>
                <Text className='text-3xl font-bold text-myPriFont text-center mb-10' >登录</Text>
                <TextInput
                    placeholder='输入注册时使用的邮箱'
                    placeholderTextColor='#FFFFFF'
                    value={email}
                    onChangeText={setEmail}
                    className='border border-myButton rounded-md p-2 mt-6 h-12 text-myPriFont'
                />
                <TextInput
                    placeholder='请输入你的密码'
                    placeholderTextColor='#FFFFFF'
                    value={password} 
                    onChangeText={setPassword}
                    className='border border-myButton rounded-md p-2 mt-6 h-12 text-myPriFont'
                    secureTextEntry={true}
                />

                <Pressable
                    className='bg-myButton rounded-md p-2 mt-6 h-12 flex items-center justify-center'
                    onPress={handleSignIn}
                >
                    <Text className='text-white text-center font-semibold text-lg'>{loading ? '登录中...' : '登录'}</Text>
                </Pressable>

                <View className='flex-row justify-center mt-4'>
                    <Text className='text-myPriFont'>没有账号？ </Text>
                    <Link href='/registerUser' className='text-myButton'>注册</Link>
                </View>

            </View>

        </SafeAreaView>
    )
}

const styles = StyleSheet.create({ 
    container: {  
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },  
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 10,
        width: '80%',
    },
    button: {
        backgroundColor: '#5E5BE6',
        padding: 10,
        borderRadius: 5,
        width: '80%',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
    link: {
        color: '#5E5BE6',
        marginTop: 10,
    },
    linkText: {
        color: '#5E5BE6',
        fontSize: 16,
    },
})

export default loginUser 