import { useGlobalContext } from "@/context/GlobalContext";
import { searchPosts } from "@/lib/appwrite";
import { MasonryFlashList } from "@shopify/flash-list";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useDebounce } from "use-debounce";

const SearchPage = () => {
  const { freshPostCnt } = useGlobalContext();
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query, 300);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pageNumber, setPageNumber] = useState(0);
  const pageSize = 6;

  // 核心修改：参数匹配的搜索方法
  const fetchPosts = async (isRefresh = false) => {
    if (loading) return;
    setLoading(true);

    let currentPage = pageNumber;
    if (isRefresh) {
      currentPage = 0;
      setPageNumber(0);
      setHasMore(true);
      setRefreshing(true);
    }

    try {
      const newPosts = await searchPosts(
        debouncedQuery,  // 搜索关键词
        currentPage,     // 当前页码
        pageSize         // 每页数量
      );

      if (isRefresh) {
        setResults(newPosts);
      } else {
        setResults(prev => [...prev, ...newPosts]);
      }

      setPageNumber(currentPage + 1);
      setHasMore(newPosts.length === pageSize);
    } catch (error) {
      console.error('搜索失败:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (debouncedQuery) {
      fetchPosts(true);
    } else {
      setResults([]);
    }
  }, [debouncedQuery, freshPostCnt]);

  return (
    <View className="flex-1 bg-myBG">
      {/* 搜索栏（保持原有样式） */}
      <View className="p-4 bg-mySecondaryBG">
        <TextInput
          className="h-12 bg-white rounded-lg px-4 text-myPriFont"
          placeholder="搜索帖子..."
          placeholderTextColor="#6B7280"
          value={query}
          onChangeText={setQuery}
        />
      </View>

      {/* 瀑布流列表（参数完全匹配） */}
      <MasonryFlashList
        data={results}
        numColumns={2}
        onEndReached={() => hasMore && fetchPosts()}
        onEndReachedThreshold={0.7}
        refreshing={refreshing}
        onRefresh={() => fetchPosts(true)}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center mt-20">
            <Text className="text-mySecFont text-lg">
              {debouncedQuery ? "未找到相关结果" : "输入关键词开始搜索"}
            </Text>
          </View>
        }
        ListFooterComponent={
          loading ? <ActivityIndicator size="large" className="my-4" /> : null
        }
        renderItem={({ item }) => (
          <BlurView 
            intensity={80}
            tint="dark"
            style={styles.blur}
          >
            <Pressable
              className="flex-1 flex-col rounded-sm m-1"
              onPress={() => { 
                router.push(`/detail/${item?.$id}`);
              }}
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
                <View className="flex-row justify-between items-center mt-2">
                  <View className="flex-row items-center">
                    <Image
                      source={{ uri: item?.creator_avatar_url }}
                      className="w-8 h-8 rounded-full"
                    />
                    <Text className="text-sm text-mySecFont ml-2">
                      {item?.creator_name}
                    </Text>
                  </View>
                  <Pressable
                    className="bg-myButton rounded-full px-4 py-1"
                    onPress={() => router.push(`/detail/${item?.$id}`)}
                  >
                    <Text className="text-myPriFont">查看</Text>
                  </Pressable>
                </View>
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
  
export default SearchPage;