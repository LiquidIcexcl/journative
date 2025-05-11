import AlbumPicker, { MediaAsset } from '@/components/Album';
import Bookshelf from '@/components/bookshelf';
import PopPage from '@/components/PopPage';
import { useGlobalContext } from '@/context/GlobalContext';
import { createPost, uploadFile } from '@/lib/appwrite';
import { ImageResult, manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Platform, Pressable, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';
import { ID } from 'react-native-appwrite';
// import { Video } from 'react-native-compressor';

export default function PostAdd() {
  const [image, setImage] = useState<string | null>(null);
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false)
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [mediaList, setMediaList] = useState<string[]>([]);
  const [showAlbum, setShowAlbum] = useState(false);
  const [hasVideo, setHasVideo] = useState(-1);
  

  const {user, refreshPosts} = useGlobalContext()

  // const handleAdd = async () => {
  //   if (!image || !title || !content) {
  //     Alert.alert('请填写完整信息')
  //     return
  //   }

    
  //   setLoading(true)
  //   try {
  //     const res = await createPost(title, content, image, mediaList, user.userId, user.name, user.avatarUrl)
  //     setLoading(false)
  //     setTitle('')
  //     setContent('')
  //     setImage(null)
  //     Alert.alert('发布成功')
  //     refreshPosts()
  //     router.push('/')
  //   } catch (error) {
  //     console.log('发布失败');
  //     console.log(error)
  //     setLoading(false)
  //     Alert.alert('发布失败')
  //   }
  // }

  const handleAdd = async () => {
    if (!title || !content) {
      Alert.alert('请填写完整信息');
      return;
    }
  
    setLoading(true);
    try {
      // 上传封面图片（如果存在） 
      let coverUrl = "";
      let map_id = 1;
      // if (image && !image.startsWith('http')) {  // 如果是本地URI才上传
      //   const { fileUrl } = await uploadFile(ID.unique(), 'image', { uri: image });
      //   coverUrl = fileUrl.toString();
      // }
      if (mediaAssets[0]?.uri && !mediaAssets[0].uri.startsWith('http')) {  // 如果是本地URI才上传
        // 特判mediaAssets[0]，如果是类型是视频，直接使用则压缩成图再上传
        if (mediaAssets[0].type === 'video') {
          if(hasVideo===-1)setHasVideo(0);
          const compressed = await compressImage(mediaAssets[0].uri); 
          if (compressed) { 
            const { fileUrl } = await uploadFile(ID.unique(), 'image', { uri: compressed.uri });
            coverUrl = fileUrl.toString();
          }
        } else {
          const { fileUrl } = await uploadFile(ID.unique(), 'image', { uri: mediaAssets[0].uri });
          coverUrl = fileUrl.toString();
        }
      }
      console.log('封面图上传成功', coverUrl);
      
      
      // 上传所有媒体资源
      const mediaUrls = await Promise.all(
        mediaAssets.map(async (asset) => {
          try {
            map_id++;
            // 压缩图片（如果是图片）
            let processedAsset = asset;
            if (asset.type === 'image') {
              const compressed = await compressImage(asset.uri);
              processedAsset = { ...asset, uri: compressed?.uri || asset.uri };
            } else {
              if(hasVideo===-1)setHasVideo(map_id);
            }
  
            // 上传文件
            const { fileUrl } = await uploadFile(
              ID.unique(),
              asset.type || 'unknown', // Provide a default value
              { uri: processedAsset.uri }
            );
            // if(coverUrl === "") {
            //   coverUrl = processedAsset.uri;
            // }
            return fileUrl.toString();
          } catch (error) {
            console.error('文件上传失败:', error);
            return null;
          }
        })
      );
  
      // 过滤掉上传失败的项目
      const validMediaUrls = mediaUrls.filter(url => url !== null) as string[];
  
      // 创建帖子
      const res = await createPost(
        title,
        content,
        coverUrl,  // 如果没有封面图传空字符串
        validMediaUrls,
        user.userId,
        user.name,
        user.avatarUrl,
        hasVideo
      );
  
      // 重置状态
      setLoading(false);
      setTitle('');
      setContent('');
      setImage(null);
      setMediaAssets([]);
      Alert.alert('发布成功');
      refreshPosts();
      router.push('/');
    } catch (error) {
      console.error('发布失败:', error);
      setLoading(false);
      Alert.alert('发布失败');
    }
  };










  const handleSelectMedia = (assets: MediaAsset[], isEnd: boolean) => {
      const typedAssets = assets.map(asset => ({
        ...asset,
        type: asset.uri.match(/\.(mp4|mov|avi)$/i) ? 'video' : 'image'
      }));
      setMediaAssets(typedAssets);
      // setMediaAssets(assets);
      if(isEnd) setShowAlbum(false); 
      
    };

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
      console.log('压缩图片失败')
      console.log(error)
      return null
    }
  } 
  
  

  const pickImage = async () => {
    let imageType = ""; 
    try {
      // No permissions request is necessary for launching the image library
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
      if (result.assets && result.assets.length > 0) {
        imageType = result.assets[0].type?.toString() || "";
        console.log('选择媒体结果,文件类型', result.assets[0].type);
      } else {
        console.log('未选择任何媒体或媒体无效');
      }
  
  
      if (!result.canceled) {
        if(imageType === 'image') {
          const compressedImage = await compressImage(result.assets[0].uri)
          console.log('压缩图片成功,类型', compressedImage?.uri);
          if (compressedImage) {
            setImage(compressedImage.uri)
            const {fileId, fileUrl} = await uploadFile(ID.unique(), imageType, compressedImage as ImageResult)
            setImage(fileUrl.toString())
            console.log('上传图片成功');
            
          }
        } 
        else if (imageType === 'video') {   
          // const compressedUri = await compressVideo(result.assets[0].uri);
          // console.log('压缩视频成功,类型', compressedUri);
          // if (compressedUri) {
            // setImage(compressedUri)
            const {fileId, fileUrl} = await uploadFile(ID.unique(), imageType, { uri: result.assets[0].uri })
            setImage(fileUrl.toString())
            console.log('上传视频成功');
          }
          
        
         
        
        
      }
    } catch (error) {
      console.log('选择图片失败')
      console.log(error)
      Alert.alert('图片选择失败')
    }


  };

  return (
    // <SafeAreaView className='flex-1 bg-myBackGround flex-col items-center' style={{marginTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0}}> 
    <SafeAreaView className='flex-1 flex-col items-center' style={styles.safeArea}> 
      <Pressable
        onPress={handleAdd}
        className='w-[300px] h-[40px] rounded-lg bg-myButton p-2 flex items-center justify-center'
      >
        <Text className='text-myWhite text-xl'>{loading ? '发布中...' : '发布'}</Text>
      </Pressable>

      {/* <Pressable 
        onPress={pickImage}
        className='border-2 mt-10 h-[260px] w-[300px] rounded-lg border-myGreen'
      >
        <View className='flex-1 items-center justify-center'>
          {
            image ? <Image source={{uri: image}} className='w-full h-full rounded-lg' /> : <Text>点击选择图片</Text>
          }
        </View>
      </Pressable> */}

      <Bookshelf assets={mediaAssets} />

      <TextInput
        placeholder='标题'
        placeholderTextColor='rgba(240, 240, 240, 0.75)'
        value={title}
        onChangeText={setTitle}
        className='text-myPriFont w-[450px] h-[40px] rounded-lg border-mySecFont border-b-2 mb-12 p-2'
      />

      <TextInput
        placeholder='写下你的作品吧！'
        placeholderTextColor='rgba(240, 240, 240, 0.75)'
        value={content}
        onChangeText={setContent}
        className='text-myPriFont w-[450px] h-[250px] rounded-lg border-mySecFont border-b-2 mb-64 sp-2 justify-start'
        multiline={true}                  // 启用多行输入
        numberOfLines={4}                 // 默认显示4行
        scrollEnabled={true}              // 内容超过高度时启用滚动
        returnKeyType="default"           // 设置回车键行为
        textAlignVertical="top"           // 文本顶部对齐
      />

      <View style={styles.buttonContainer}>
              <Pressable  className='bg-myButton'
                onPress={() => setShowAlbum(true)}
                style={styles.button}
              >
                <PopPage
                  visible={showAlbum}
                  onClose={() => setShowAlbum(false)}
                  height="500"
                  contentComponent={<AlbumPicker
                    onConfirm={handleSelectMedia}
                    onCancel={() => setShowAlbum(false)}
                    maxSelection={5}
                    live={true}
                    currentAssets={mediaAssets}
                    containerHeight={500}
                  />}
                />        
                <Text className='color-myPriFont'>选择相册</Text>
              </Pressable>
      </View> 
      


      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'rgba(0, 7, 8, 0.94)',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  buttonContainer: {
    position: 'absolute',
    color: '#FFFFFF',
    bottom: 40,
    alignSelf: 'center'
  },
  button: { 
    borderRadius: 5,
    padding: 10,
    marginTop: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
  },
  input: {
    width: '80%',
    height: 40,
    borderColor: '#CCCCCC',
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    marginTop: 10,
  },
  imagePreview: {
    width: '80%',
    height: 200,
    borderRadius: 5,
    marginTop: 10,
  },
  imageContainer: {
    width: '80%',
    height: 200,
    borderRadius: 5,
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  imageText: {
    color: '#888888',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 5,
  },
  textInput: {
    width: '80%',
    height: 40,
    borderColor: '#CCCCCC',
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    marginTop: 10,
  },
  textArea: {
    width: '80%',
    height: 100,
    borderColor: '#CCCCCC',
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    marginTop: 10,
  },
  textAreaInput: {
    width: '100%',
    height: '100%',
    borderRadius: 5,
    paddingLeft: 10,
    marginTop: 10,
  },
});
