import { uploadFile } from '@/lib/appwrite'
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator'
import * as ImagePicker from 'expo-image-picker'
import React, { useState } from 'react'
import { ActivityIndicator, Alert, Image, Pressable, View } from 'react-native'
import { ID } from 'react-native-appwrite'

interface Props {
  onUploadSuccess?: (uri: string) => void;
}

const ImageUploadButton = ({ onUploadSuccess }: Props) => {
  const [uploadedUri, setUploadedUri] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const compressImage = async (uri: string, quality = 0.2, maxWidth = 640) => {
    try {
      return await manipulateAsync(
        uri,
        [{ resize: { width: maxWidth } }],
        { compress: quality, format: SaveFormat.JPEG }
      )
    } catch (error) {
      console.log('压缩失败:', error)
      throw error
    }
  }

  const handlePress = async () => {
    if (isUploading) return

    try {
      setIsUploading(true)
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // 方形裁剪适合圆形按钮
        quality: 1,
      })

      if (result.canceled || !result.assets?.[0]) {
        return
      }

      const asset = result.assets[0]
      const compressed = await compressImage(asset.uri)
      
      if (!compressed) {
        throw new Error('压缩失败')
      }

      const { fileUrl } = await uploadFile(
        ID.unique(),
        'image',
        compressed
      )
      const uri = fileUrl.toString()
      setUploadedUri(uri)
      onUploadSuccess?.(uri) // 新增回调
    } catch (error) {
      console.error('上传失败:', error)
      Alert.alert('上传失败', '请稍后再试')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Pressable
      onPress={handlePress}
      style={{
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#e0e0e0',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      {isUploading ? (
        <ActivityIndicator size="small" color="#4CAF50" />
      ) : (
        uploadedUri && (
          <Image
            source={{ uri: uploadedUri }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        )
      )}
      
      {/* 默认显示加号图标 */}
      {!uploadedUri && !isUploading && (
        <View style={{
          width: 40,
          height: 40,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <View style={{
            width: 30,
            height: 4,
            backgroundColor: '#5E5BE6',
            position: 'absolute',
          }}/>
          <View style={{
            width: 4,
            height: 30,
            backgroundColor: '#5E5BE6',
            position: 'absolute',
          }}/>
        </View>
      )}
    </Pressable>
  )
}

export default ImageUploadButton