import React, { useEffect, useState } from "react";
import { View, Text, StatusBar, Pressable, Image } from "react-native";
import { MasonryFlashList } from "@shopify/flash-list";
import { getFollowingUsers, getPosts } from "@/lib/appwrite";
import { useGlobalContext } from "@/context/GlobalContext";
import { router } from "expo-router";

const Index_follow = () => {

    const {freshPostCnt} = useGlobalContext()

    const pageSize = 6
    const [posts, setPosts] = useState<any[]>([])
    const [pageNumber, setPageNumber] = useState(0)
    const [loading, setLoading] = useState(false)
    const [hasMore, setHasMore] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    const { user } = useGlobalContext()

    const fetchPosts = async (isRefresh = false) => {
      if (loading || !user?.userId) return
      setLoading(true)
      
      let page = pageNumber

      if (isRefresh) {
        setRefreshing(true)
        setPageNumber(0)
        setHasMore(true)
        page = 0
      }

      let followingUsers = await getFollowingUsers(user?.userId)
      if (followingUsers.length === 0) {
        followingUsers = ['0']
      }

      
      try {
        const newPosts = await getPosts(page, pageSize, followingUsers)
        if (isRefresh) {
          setPosts(newPosts)
        } else {
          setPosts(prevPosts => [...prevPosts, ...newPosts])
        }
        setPageNumber(page + 1)
        setHasMore(newPosts.length === pageSize)
      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    }

    useEffect(() => {
      fetchPosts(true)
    }, [freshPostCnt, user])

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
        <Pressable
          className="flex-1 flex-col bg-myWhite rounded-sm m-1"
          onPress={() => {
            router.push(`/detail/${item?.$id}`)
          }}
        >
          <Image source={{ uri: item?.image_url }}
            style={{
              width: '100%',
              height: 200,
              maxHeight: 270,
              aspectRatio: 1,
            }}
            resizeMode="cover"
          />
          <View className="flex-col">
            <Text className="font-bold mt-1 text-md">{item?.title}</Text>
            <Text className="text-sm  mt-1">{item?.content}</Text>
          </View>
        </Pressable>
      }
      estimatedItemSize={200}
    />
  )
}

export default Index_follow