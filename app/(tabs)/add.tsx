import { useGlobalContext } from '@/context/GlobalContext';
import { createPost, uploadFile } from '@/lib/appwrite';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, Pressable, SafeAreaView, Text, TextInput, View } from 'react-native';
import { ID } from 'react-native-appwrite';

export default function Add() {
  const [image, setImage] = useState<string | null>(null);
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false)

  const {user, refreshPosts} = useGlobalContext()

  const handleAdd = async () => {
    if (!image || !title || !content) {
      Alert.alert('请填写完整信息')
      return
    }

    
    setLoading(true)
    try {
      const res = await createPost(title, content, image, user.userId, user.name, user.avatarUrl)
      setLoading(false)
      setTitle('')
      setContent('')
      setImage(null)
      Alert.alert('发布成功')
      refreshPosts()
      router.push('/')
    } catch (error) {
      console.log(error)
      setLoading(false)
      Alert.alert('发布失败')
    }
    
  }

  const compressImage = async (uri:string, quality = 0.2, maxWidth = 640) => {
    try {
      const mainpResult = await manipulateAsync(
        uri,
        [
          {resize: {width: maxWidth}}
        ],
        {
          compress: quality,
          format: SaveFormat.JPEG,
        },

      )
      return mainpResult
    } catch (error) {
      console.log(error)
      return null
    }
  }

  const pickImage = async () => {
    try {
      // No permissions request is necessary for launching the image library
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
  
  
      if (!result.canceled) {
        const compressedImage = await compressImage(result.assets[0].uri)
        if (compressedImage) {
          // setImage(compressedImage.uri)
          const {fileId, fileUrl} = await uploadFile(ID.unique() , compressedImage)
          setImage(fileUrl.toString())
        }
      }
    } catch (error) {
      console.log(error)
      Alert.alert('图片选择失败')
    }


  };

  return (
    <SafeAreaView className='flex-1 bg-myBackGround flex-col items-center'>
      <Pressable 
        onPress={pickImage}
        className='border-2 mt-10 h-[260px] w-[300px] rounded-lg border-myGreen'
      >
        <View className='flex-1 items-center justify-center'>
          {
            image ? <Image source={{uri: image}} className='w-full h-full rounded-lg' /> : <Text>点击选择图片</Text>
          }
        </View>
      </Pressable>

      <TextInput
        placeholder='标题'
        value={title}
        onChangeText={setTitle}
        className='w-[300px] h-[40px] rounded-lg border-myGreen border-2 mt-10 p-2'
      />

      <TextInput
        placeholder='内容'
        value={content}
        onChangeText={setContent}
        className='w-[300px] h-[40px] rounded-lg border-myGreen border-2 mt-10 p-2'
      />

      <Pressable
        onPress={handleAdd}
        className='w-[300px] h-[40px] rounded-lg bg-myGreen mt-10 p-2 flex items-center justify-center'
      >
        <Text className='text-myWhite text-xl'>{loading ? '发布中...' : '发布'}</Text>
      </Pressable>
      


      
    </SafeAreaView>
  );
}
