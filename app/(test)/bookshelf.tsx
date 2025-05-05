import React from 'react';
import {
    Animated,
    Image,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { GestureHandlerRootView, PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import { runOnJS, useAnimatedGestureHandler } from 'react-native-reanimated';

type LayoutNode = {
  items: string[];
  direction: 'row' | 'column';
  children: LayoutNode[];
};

const Bookshelf: React.FC<{items: string[]}> = ({items}) => {
  // 生成布局树的递归函数（示例简化版）
  const generateLayout = (count: number): LayoutNode => {
    // 实际需要根据不同count返回不同结构
    if (count === 1) {
      return {items: [items[0]], direction: 'row', children: []};
    }
    // 其他数量的布局生成逻辑
    return {items: [], direction: 'row', children: []};
  };

  // 拖动交换逻辑
  const handleDragEnd = (fromIndex: number, toIndex: number) => {
    // 交换数组元素逻辑
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.shelf}>
        {/* 递归渲染布局树 */}
        {renderLayoutTree(generateLayout(items.length))}
      </View>
    </GestureHandlerRootView>
  );
};

// 递归渲染函数
const renderLayoutTree = (node: LayoutNode) => {
    function handleDragEnd(from: number, to: number): void {
        throw new Error('Function not implemented.');
    }

  return (
    <View style={{flexDirection: node.direction, flex: 1}}>
      {node.items.map((uri, index) => (
        <DraggableItem
          key={uri}
          uri={uri}
          index={index}
          onDragEnd={handleDragEnd}
        />
      ))}
      {node.children.map((child, i) => (
        <View key={i} style={{flex: 1}}>
          {renderLayoutTree(child)}
        </View>
      ))}
    </View>
  );
};

// 可拖动组件
const DraggableItem: React.FC<{
  uri: string;
  index: number;
  onDragEnd: (from: number, to: number) => void;
}> = ({uri, index, onDragEnd}) => {
  const translateX = new Animated.Value(0);
  const translateY = new Animated.Value(0);

  const gestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
    onActive: (event) => {
      translateX.setValue(event.translationX);
      translateY.setValue(event.translationY);
    },
    onEnd: (event) => {
      // 计算落点位置
      const newIndex = Math.round(event.translationY / 100); // 示例计算逻辑，根据实际需求调整
      runOnJS(onDragEnd)(index, newIndex);
    },
  });

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View
        style={{
          transform: [{translateX}, {translateY}],
        }}>
        <TouchableOpacity>
          <Image source={{uri}} style={styles.media} />
        </TouchableOpacity>
      </Animated.View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  shelf: {
    flex: 1,
    backgroundColor: '#fff',
  },
  media: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});

export default Bookshelf;