import { useGlobalContext } from "@/context/GlobalContext";
import { getCurrentUserPosts } from "@/lib/appwrite";
import { MasonryFlashList } from "@shopify/flash-list";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from "react-native";

const viaState: any[] = ['未审核', '已审核', '已拒绝'];

const ProfilePage = () => {
  const { user, freshPostCnt } = useGlobalContext();
  const [posts, setPosts] = useState<any[]>([]);
  const [pageNumber, setPageNumber] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const pageSize = 6;

  const fetchPosts = async (isRefresh = false) => {
    if (!user?.userId || loading) return;
    
    setLoading(true);
    let page = pageNumber;

    if (isRefresh) {
      page = 0;
      setRefreshing(true);
      setPageNumber(0);
      setHasMore(true);
    }

    try {
      const newPosts = await getCurrentUserPosts(user.userId, page, pageSize);
      
      if (isRefresh) {
        setPosts(newPosts);
      } else {
        setPosts(prev => [...prev, ...newPosts]);
      }

      setPageNumber(page + 1);
      setHasMore(newPosts.length === pageSize);
    } catch (error) {
      console.error('加载失败:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user?.userId) {
      fetchPosts(true);
    }
  }, [user?.userId, freshPostCnt]);

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center bg-myBG">
        <Text className="text-myPriFont text-lg">请先登录</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-myBG">
      {/* 用户信息栏 */}
      <BlurView intensity={80} tint="dark" className="p-4 m-4 rounded-lg">
        <View className="flex-row items-center">
          <Image
            source={{ uri: user.avatarUrl }}
            className="w-20 h-20 rounded-full"
          />
          <View className="ml-4">
            <Text className="text-myPriFont text-xl font-bold">{user.name}</Text>
            <Text className="text-mySecFont mt-1">{posts.length} 个帖子</Text>
          </View>
        </View>
      </BlurView>

      {/* 帖子列表 */}
      <MasonryFlashList
        data={posts}
        numColumns={2}
        onEndReached={() => {
          if (hasMore && pageNumber > 0) {
            fetchPosts()
          }
        }}
        onEndReachedThreshold={0.7}
        refreshing={refreshing}
        onRefresh={() => fetchPosts(true)}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center mt-20">
            <Text className="text-mySecFont text-lg">还没有发布过帖子</Text>
          </View>
        }
        ListFooterComponent={
          loading ? <ActivityIndicator size="large" className="my-4" /> : null
        }
        renderItem={({ item }) => (
          <BlurView intensity={80} tint="dark" style={styles.blur}> 
            <Pressable
              className="flex-1 flex-col rounded-sm m-1"
              onPress={() => router.push(`/detail/${item?.$id}`)}
            >
              <Image
                source={{ uri: item?.image_first_url }}
                className="w-full max-h-300"
                style={{ aspectRatio: 1 }}
                resizeMode="cover"
              />
              <View className="flex-col p-2">
                <Text className="font-bold text-md text-myPriFont">{item?.title}</Text>
                <Text 
                  className="text-sm text-mySecFont mt-1"
                  numberOfLines={2}
                >
                  {item?.content}
                </Text>
                <Text className="text-sm text-mySecFont w-full mt-1 text-right">
                  {viaState[item?.via_state]}
                </Text>
              </View>
            </Pressable>
          </BlurView>
        )}
        estimatedItemSize={200}
      />
    </View>
  );
};
 
const styles = StyleSheet.create({
  blur: { 
    backgroundColor: 'rgba(10, 17, 44, 0.64)',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 2, 
    borderRadius: 2, 
    margin: 2,
    justifyContent: 'center',
    overflow: 'hidden',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
  }
});

export default ProfilePage;