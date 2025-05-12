import { useGlobalContext } from "@/context/GlobalContext";
import { followUser, getFollowingUsers, getUserByUserId as getUserById, getCurrentUserPosts as getUserPosts, unFollowUser } from "@/lib/appwrite";
import { MasonryFlashList } from "@shopify/flash-list";
import { BlurView } from "expo-blur";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from "react-native";

interface ProfilePageProps {
    profile_id?: string; // 新增props参数
}

const ProfilePage = ({ profile_id: propProfileId }: ProfilePageProps) => {
  const { user: currentUser } = useGlobalContext();
//   const { profile_id } = useLocalSearchParams<{ profile_id: string }>();
  const routeParams = useLocalSearchParams<{ profile_id: string }>()
  const profile_id = propProfileId || routeParams.profile_id
  const [targetUser, setTargetUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [pageNumber, setPageNumber] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const pageSize = 6;

  // 判断是否查看自己
  const isCurrentUser = profile_id === currentUser?.userId;

  // 获取用户信息
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await getUserById(profile_id!);
        if (!userData) {
          router.back();
          return;
        }
        setTargetUser(userData);
        
        // 检查关注状态
        if (!isCurrentUser) {
          const followingUsers = await getFollowingUsers(currentUser?.userId) 
          setIsFollowing(followingUsers.some((user: any) => user === profile_id));
        }
      } catch (error) {
        console.error('加载用户信息失败:', error);
        router.back();
      }
    };

    if (profile_id) loadUserData();
  }, [profile_id]);

  // 获取帖子列表
  const fetchPosts = async (isRefresh = false) => {
    if (!profile_id || loading) return;
    
    setLoading(true);
    let page = pageNumber;

    if (isRefresh) {
      page = 0;
      setRefreshing(true);
      setPageNumber(0);
      setHasMore(true);
    }

    try {
      let newPosts = await getUserPosts(profile_id, page, pageSize);
      newPosts = newPosts.filter((post: any) => post?.via_state === 1) 
      
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

  // 处理关注操作
  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await unFollowUser(currentUser?.userId!, profile_id!);
      } else {
        await followUser(currentUser?.userId!, profile_id!);
      }
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error('操作失败:', error);
    }
  };

  if (!targetUser) {
    return (
      <View className="flex-1 items-center justify-center bg-myBG">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-myBG">
      {/* 用户信息栏 */}
      <BlurView intensity={80} tint="dark" className="p-4 m-4 rounded-lg">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Image
              source={{ uri: targetUser.avatar_url || null }}
              className="w-20 h-20 rounded-full"
            />
            <View className="ml-4">
              <Text className="text-myPriFont text-xl font-bold">
                {targetUser.name}
              </Text>
              <Text className="text-mySecFont mt-1">
                {posts.length} 个帖子
              </Text>
            </View>
          </View>
          
          {!isCurrentUser && (
            <Pressable
              className={`px-4 py-2 rounded-full ${
                isFollowing ? 'bg-gray-500' : 'bg-myButton'
              }`}
              onPress={handleFollow}
            >
              <Text className="text-myPriFont">
                {isFollowing ? '已关注' : '关注'}
              </Text>
            </Pressable>
          )}
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
                  {/* 保持和 FoundPage 相同的渲染逻辑 */}
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