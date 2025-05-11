import { useGlobalContext } from "@/context/GlobalContext";
import { getPosts } from "@/lib/appwrite";
import { MasonryFlashList } from "@shopify/flash-list";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

const FoundPage = () => {

    const {freshPostCnt} = useGlobalContext()

    const pageSize = 6
    const [posts, setPosts] = useState<any[]>([])
    const [pageNumber, setPageNumber] = useState(0)
    const [loading, setLoading] = useState(false)
    const [hasMore, setHasMore] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [hasVideo, setHasVideo] = useState(-1)

    useEffect(() => {
      fetchPosts(true)
    }, [freshPostCnt])

    const getHasVideo = () => {
      return hasVideo
    }

    const fetchPosts = async (isRefresh = false) => {
      if (loading) return
      setLoading(true)

      let page = pageNumber

      if (isRefresh) {
        setRefreshing(true)
        setPageNumber(0)
        setHasMore(true)
        page = 0
      }
      
      try {
        const newPosts = await getPosts(page, pageSize)
        if (isRefresh) {
          setPosts(newPosts)
        } else {
          setPosts(prevPosts => [...prevPosts, ...newPosts])
        }
        setPageNumber(page + 1)
        setHasMore(newPosts.length === pageSize)
      } catch (error) {
        console.log('获取帖子失败')
        console.log(error)
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    }

    

  return (
    <MasonryFlashList
      data={posts}
      numColumns={2}
      onEndReached={() => {
        if (hasMore && pageNumber > 0) {
          fetchPosts()
        }
      }}
      refreshing={refreshing}
      onRefresh={() => {
        fetchPosts(true)
      }}
      onEndReachedThreshold={0.7}
      renderItem={({ item }) => 
        <BlurView 
        intensity={80}         // 模糊强度 (0-100)
        tint="dark"          // 底色滤镜 (light/default/dark) 
        style={styles.blur}   
        >
        <Pressable
          className="flex-1 flex-col rounded-sm m-1"
          onPress={() => {
            setHasVideo(item?.has_video)
            router.push(`/detail/${item?.$id}`)
          }}
        >
          <Image source={{ uri: item?.image_first_url }}
            style={{
              width: '100%',
              // height: '80%',
              maxHeight: 300,
              aspectRatio: 1,
            }}
            resizeMode="cover"
          />
          <View className="flex-col">
            <Text className="font-bold mt-1 text-md text-myPriFont">{item?.title}</Text>
            <Text className="text-sm text-mySecFont mt-1">{item?.content}</Text>
            <View className="flex-row items-between justify-between mt-2"> 
              <View className="flex-row">
                <Image
                  source={{ uri: item?.creator_avatar_url }}
                  className='w-8 h-8 rounded-full'
                />
                <Text className="text-sm text-mySecFont mt-1 ml-1">{item?.creator_name}</Text>
              </View>
              <View className="flex-row">
                <Pressable
                  onPress={() => {
                    setHasVideo(-1)
                    router.push(`/detail/${item?.$id}`)
                  }}
                  className="flex-row items-center justify-center bg-myButton rounded-full px-4 py-1"
                >
                  <Text className="text-myPriFont">查看</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Pressable>
        </BlurView>
      }
      estimatedItemSize={200}
    />
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  blur: { 
    backgroundColor: 'rgba(10, 17, 44, 0.64)', // 设置背景颜色
    // 投影 
    shadowColor: '#FFFFFF',
    shadowOffset: {
      width: 1,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 2, 
    borderRadius: 2, 
    margin: 2,
    justifyContent: 'center',
    overflow: 'hidden', // 确保圆角效果
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
  },
  text: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center'
  }
});

export default FoundPage