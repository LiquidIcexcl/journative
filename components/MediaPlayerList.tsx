import React, {
  forwardRef,
  ForwardRefRenderFunction,
  useImperativeHandle,
  useRef,
  useState
} from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
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
  
    useImperativeHandle(ref, () => ({
      switchToIndex: (index: number) => {
        flatListRef.current?.scrollToIndex({ index });
      }
    }));
  
    const handleScrollEnd = (event: { nativeEvent: { contentOffset: { x: number } } }) => {
      const newIndex = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
      if (newIndex === currentIndex) return;
  
      // 暂停上一个视频
      playersRef.current[currentIndex]?.pause();
      // 播放新视频
      playersRef.current[newIndex]?.play();
  
      setCurrentIndex(newIndex);
    };
  
    return (
      <Animated.View style={styles.container}>
        <FlatList
          ref={flatListRef}
          data={mediaUris}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={initialIndex===-1?0:initialIndex}
          onMomentumScrollEnd={handleScrollEnd}
          onScroll={(event) => {
            translateX.value = -event.nativeEvent.contentOffset.x;
          }}
          renderItem={({ item, index }) => (
            <View style={styles.itemContainer}>
              <MediaPlayer
                ref={(ref) => { playersRef.current[index] = ref; }}
                uri={item}
                // autoPlay={index === initialIndex}
                autoPlay={true}
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