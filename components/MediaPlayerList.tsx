import React, {
  forwardRef,
  ForwardRefRenderFunction,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from 'react';
import { Dimensions, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import Animated, { useSharedValue } from 'react-native-reanimated';
import MediaPlayer, { MediaPlayerHandle } from './MediaPlayer';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type MediaPlayerListProps = {
  mediaUris: string[];
  initialIndex: number;
};

type MediaPlayerListHandle = {
  switchToIndex: (index: number) => void;
};

const MediaPlayerListComponent: ForwardRefRenderFunction<MediaPlayerListHandle, MediaPlayerListProps> = (
  { mediaUris, initialIndex },
  ref
) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const translateX = useSharedValue(-SCREEN_WIDTH * initialIndex);
  const flatListRef = useRef<FlatList>(null);
  const playersRef = useRef<(MediaPlayerHandle | null)[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useImperativeHandle(ref, () => ({
    switchToIndex: (index: number) => {
      flatListRef.current?.scrollToIndex({ index });
    }
  }));

  useEffect(() => {
    // 在组件加载时，自动播放 initialIndex 对应的视频
    return () => {
      if (initialIndex !== -1 && playersRef.current[initialIndex]) {
        playersRef.current[initialIndex]?.play();
      }
    };
  }, [initialIndex]);

  // useEffect(() => {
  //   // 组件卸载时，暂停所有视频
  //   return () => {
  //     playersRef.current.forEach((player) => {
  //       player?.pause();
  //     });
  //   };
  // }, []);
  
  useEffect(() => {
    // 当组件在加载时，缓冲500ms后播放视频
    const timer = setTimeout(() => {
      if (initialIndex !== -1 && playersRef.current[initialIndex]) {
        playersRef.current[initialIndex]?.play();
      }
      else {
        playersRef.current[0]?.play();
      }
      setIsLoading(false);
    }, 1000);
    return () => {
      clearTimeout(timer);
    };
  }, [initialIndex]);

  useEffect(() => {
    setIsLoading(false); 
  },[]);


  const handleScrollEnd = (event: { nativeEvent: { contentOffset: { x: number } } }) => {
    const newIndex = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    if (newIndex === currentIndex) return;

    // 暂停上一个视频
    playersRef.current[currentIndex]?.pause();
    // 播放新视频
    playersRef.current[newIndex]?.play();

    setCurrentIndex(newIndex);
  };

  const getinitVideoIndex = () => {
    console.log('即将播放：', initialIndex);
    return initialIndex!== -1 ? initialIndex : 0;
  };

  if (isLoading) {
    return (
      <SafeAreaView className='flex-1 bg-myBG flex-col mt-8'>
          <View className='flex-1 justify-center items-center'>
              <Text className='text-myPriFont'>加载中...</Text>
          </View>
      </SafeAreaView>
    );
  }
  return (
    <Animated.View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={mediaUris}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={getinitVideoIndex()}
        onMomentumScrollEnd={handleScrollEnd}
        onScroll={(event) => {
          translateX.value = -event.nativeEvent.contentOffset.x;
        }}
        renderItem={({ item, index }) => (
          <View style={styles.itemContainer}>
            <MediaPlayer
              ref={(ref) => {
                playersRef.current[index] = ref;
              }}
              uri={item}
              autoPlay={index === getinitVideoIndex()}
              onPlaybackStatusUpdate={(status) => {
                // 状态更新逻辑...TODO
                // 例如：如果视频播放完毕，自动切换到下一个视频
              }}
            />
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index
        })} 
        onLayout={() => {
          // 在 FlatList 布局完成后，滚动到 initialIndex 并播放对应视频
          if (initialIndex !== -1) {
            flatListRef.current?.scrollToIndex({ index: initialIndex, animated: false });
            setTimeout(() => {
              playersRef.current[initialIndex]?.play(); // 确保播放目标索引的视频
            }, 100); // 延迟以确保滚动完成
          }
        }}
      />
    </Animated.View>
  );
};

const MediaPlayerList = forwardRef(MediaPlayerListComponent);
export default MediaPlayerList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 500
  },
  itemContainer: {
    width: SCREEN_WIDTH,
    height: '100%'
  }
});