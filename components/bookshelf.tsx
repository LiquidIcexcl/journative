import React, { useEffect, useMemo } from 'react';
import { Dimensions, Image, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import type { MediaAsset } from './Album';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CELL_SIZE = SCREEN_WIDTH / 4;
const BOOKSHELF_HEIGHT = CELL_SIZE * 2; 
let BOOKSHELF_ASSET_LENGTH = 0;
let definedPositions: Position[] = [
  // 第一个长方形区域
  { x: 0, y: 0, width: 2, height: 2 },    // 位置0 (1)
  { x: 2, y: 0, width: 1, height: 1 },    // 位置1 (2)
  { x: 2, y: 1, width: 1, height: 1 },    // 位置2 (3)
  { x: 3, y: 1, width: 1, height: 1 },    // 位置3 (4)
  { x: 3, y: 0, width: 1, height: 1 },    // 位置4 (5)
  // 第二个长方形区域
  { x: 0, y: 2, width: 1, height: 1 },    // 位置5 (6)
  { x: 0, y: 3, width: 1, height: 1 },    // 位置6 (7)
  { x: 1, y: 2, width: 1, height: 1 },    // 位置7 (8)
  { x: 1, y: 3, width: 1, height: 1 },    // 位置8 (9)
  { x: 2, y: 2, width: 1, height: 1 },    // 位置9 (10)
  { x: 2, y: 3, width: 1, height: 1 },    // 位置10 (11)
  { x: 3, y: 3, width: 1, height: 1 },    // 位置11 (12)
  { x: 3, y: 2, width: 1, height: 1 },    // 位置12 (13)
];
// 预定义布局位置
type Position = {
  x: number;
  y: number;
  width: number;
  height: number;
};
type Opponent = {
  self: number; 
  opponentX: number;
  opponentY: number;
};
// ----- -----长方形1号
// 【1】【1】【2】【5】
// 【1】【1】【3】【4】
// ----- -----长方形2号
// 【6】【8】【10】【13】
// 【7】【9】【11】【12】
// -----------
// 预定义位置数组
const predefinedPositions: Position[] = [
  // 第一个长方形区域
  { x: 0, y: 0, width: 2, height: 2 },    // 位置0 (1)
  { x: 2, y: 0, width: 1, height: 1 },    // 位置1 (2)
  { x: 2, y: 1, width: 1, height: 1 },    // 位置2 (3)
  { x: 3, y: 1, width: 1, height: 1 },    // 位置3 (4)
  { x: 3, y: 0, width: 1, height: 1 },    // 位置4 (5)
  // 第二个长方形区域
  { x: 0, y: 2, width: 1, height: 1 },    // 位置5 (6)
  { x: 0, y: 3, width: 1, height: 1 },    // 位置6 (7)
  { x: 1, y: 2, width: 1, height: 1 },    // 位置7 (8)
  { x: 1, y: 3, width: 1, height: 1 },    // 位置8 (9)
  { x: 2, y: 2, width: 1, height: 1 },    // 位置9 (10)
  { x: 2, y: 3, width: 1, height: 1 },    // 位置10 (11)
  { x: 3, y: 3, width: 1, height: 1 },    // 位置11 (12)
  { x: 3, y: 2, width: 1, height: 1 },    // 位置12 (13)
];
const opponent: Opponent[] = [
  { self: 1, opponentX: 2, opponentY: 0 }, // 位置0 (1) 对应位置5 (6)
  { self: 2, opponentX: 5, opponentY: 3 }, // 位置1 (2) 对应位置6 (7)
  { self: 3, opponentX: 4, opponentY: 0 }, // 位置2 (3) 对应位置7 (8)
  { self: 4, opponentX: 0, opponentY: 0 }, // 位置3 (4) 对应位置8 (9)
  { self: 5, opponentX: 0, opponentY: 0 }, // 位置4 (5) 对应位置9 (10) 
  { self: 6, opponentX: 8, opponentY: 7 }, // 位置5 (6) 对应位置10 (11)
  { self: 7, opponentX: 9, opponentY: 0 }, // 位置6 (7) 对应位置11 (12)
  { self: 8, opponentX: 10, opponentY: 9 }, // 位置7 (8) 对应位置12 (13)
  { self: 9, opponentX: 11, opponentY: 0 }, // 位置8 (9) 对应位置13 (14)
  { self: 10, opponentX: 13, opponentY: 11 }, // 位置9 (10) 对应位置14 (15)
  { self: 11, opponentX: 12, opponentY: 0 }, // 位置10 (11) 对应位置15 (16)
  { self: 12, opponentX: 0, opponentY: 0 }, // 位置11 (12) 对应位置16 (17)
  { self: 13, opponentX: 0, opponentY: 0 }, // 位置12 (13) 对应位置17 (18)
];
// 预定义位置数组的长度
interface DraggableItemProps {
  asset: MediaAsset;
  index: number;
  position: Position;
  activeIndex: Animated.SharedValue<number>;
  onSwap: (from: number, to: number) => void;
}
 

// 可拖拽的单个媒体项
const DraggableItem = React.memo(({
  asset,
  index,
  position,
  activeIndex,
  onSwap,
}: DraggableItemProps) => {
  const isActive = useSharedValue(false);
  const offset = useSharedValue({ x: 0, y: 0 });
  const width = useSharedValue(position.width * CELL_SIZE);
  const height = useSharedValue(position.height * CELL_SIZE);

  // 计算实际像素位置
  const baseX = position.x * CELL_SIZE;
  const baseY = position.y * CELL_SIZE; 

  useEffect(() => {
    const {opponentX, opponentY} = opponent[index];
    // console.log(`opponentX: ${opponentX}, opponentY: ${opponentY}`);
    // console.log(`position: ${position.width}, ${position.height}`);
    
    
    if(BOOKSHELF_ASSET_LENGTH<opponentX) {
      width.value = withTiming( (4-position.x) * CELL_SIZE); 
      definedPositions[index].width = width.value;
    }
    else {
      width.value = withTiming(position.width * CELL_SIZE);
      definedPositions[index].width = width.value;
    }
    if(BOOKSHELF_ASSET_LENGTH<opponentY) {
      height.value = withTiming( 2 * CELL_SIZE);
      definedPositions[index].height = height.value;
    }
    else {
      height.value = withTiming(position.height * CELL_SIZE);
      definedPositions[index].height = height.value;}

  }
  , [BOOKSHELF_ASSET_LENGTH]);
  
  // 动画
  const animatedStyle = useAnimatedStyle(() => ({ 
    position: 'absolute',
    left: baseX,
    top: baseY,
    width: width.value,
    height: height.value,
    transform: [
      { translateX: isActive.value ? offset.value.x : withSpring(0) },
      { translateY: isActive.value ? offset.value.y : withSpring(0) },
      { scale: withSpring(isActive.value ?  1.1 : 1) }
    ],
    zIndex: isActive.value ? 100 : 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isActive.value ? 0.3 : 0,
    shadowRadius: 4,
  }));

  // 手势处理
  const gesture = Gesture.Pan()
    .onStart(() => {
      isActive.value = true;
      activeIndex.value = index;
      offset.value = { x: 0, y: 0 };
    })
    .onUpdate((e) => {
      offset.value = { x: e.translationX, y: e.translationY };
      withSpring(200);
    })
    .onEnd(() => {
      isActive.value = false;
      activeIndex.value = -1;
      
      // 计算碰撞检测
      const targetX = baseX + offset.value.x + width.value / 2;
      const targetY = baseY + offset.value.y + height.value / 2;
      console.log(`Item ${index} target position:`, targetX, targetY);

      
      
      
      let targetIndex = -1;
      predefinedPositions.forEach((pos, i) => {
        if (i === index) return;
        if (i >= BOOKSHELF_ASSET_LENGTH) return; // 只检测已定义的区域
        console.log("index: ", i, "BOOKSHELF_ASSET_LENGTH: ", BOOKSHELF_ASSET_LENGTH);
        
        const posX = pos.x * CELL_SIZE;
        const posY = pos.y * CELL_SIZE;
        // const posWidth = pos.width * CELL_SIZE;
        // const posHeight = pos.height * CELL_SIZE;
        const posWidth = width.value;
        const posHeight = height.value;
        // const posWidth = definedPositions[i-1].width;
        // const posHeight = definedPositions[i-1].height;

        if (
          targetX <= posX + posWidth &&
          targetX > posX &&
          targetY <= posY + posHeight &&
          targetY > posY
        ) {
          targetIndex = i;
        }
      });

      if (targetIndex !== -1) {
        runOnJS(onSwap)(index, targetIndex);
      }
    });
  
  // 处理长按手势
  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.item, animatedStyle]}>
        <Image
          source={{ uri: asset.uri }}
          style={styles.image}
          resizeMode="cover"
        />
        {asset.mediaType === 'video' && (
          <View style={styles.videoBadge}>
            <Animated.Text style={styles.durationText}>
              {Math.floor(asset.duration / 60)}:
              {(asset.duration % 60).toString().padStart(2, '0')}
            </Animated.Text>
          </View>
        )}
      </Animated.View>
    </GestureDetector>
  );
});

interface BookshelfProps {
  assets: MediaAsset[];
}

const Bookshelf = ({ assets: initialAssets }: BookshelfProps) => {
  const [assets, setAssets] = React.useState<MediaAsset[]>(initialAssets);
  // 预定义位置数组的长度
  useEffect(() => {
    setAssets(initialAssets);
    BOOKSHELF_ASSET_LENGTH = initialAssets.length; 
  }, [initialAssets]);

  
  
  const activeIndex = useSharedValue(-1);
  
  // 合并数据与预定义位置
  const visiblePositions = useMemo(() => 
    predefinedPositions
      .slice(0, Math.min(assets.length + 5, 13)) // 最多显示13个位置
      .map((pos, index) => ({
        ...pos,
        asset: assets[index],
      }))
  , [assets]);

  const handleSwap = (fromIndex: number, toIndex: number) => {
    console.log(`Swapping ${fromIndex} with ${toIndex} length: ${BOOKSHELF_ASSET_LENGTH}`);
    
    if (fromIndex === toIndex) return;
    
    // 交换媒体数据
    const newAssets = assets.map((asset, index) => {
      if (index === fromIndex) return assets[toIndex];
      if (index === toIndex) return assets[fromIndex];
      return asset;
    });

    // 更新状态
    setAssets(newAssets); // 这里需要更新状态，假设有一个setAssets函数来更新assets
    

  };

  return (
    <GestureHandlerRootView style={styles.root}>
      <View style={styles.container}>
        {/* 第一个长方形区域 */}
        <View style={[styles.area, { height: 0 }]}>
          {visiblePositions.slice(0, 5).map((pos, index) => (
            pos.asset && (
              <DraggableItem
                key={`item-${index}`}
                index={index}
                asset={pos.asset}
                position={pos}
                activeIndex={activeIndex}
                onSwap={handleSwap}
              />
            )
          ))}
        </View>

        {/* 第二个长方形区域（当有6个以上时显示） */}
        {assets.length > 5 && (
          <View style={[styles.area]}>
            {visiblePositions.slice(5).map((pos, index) => (
              pos.asset && (
                <DraggableItem
                  key={`item-${index + 5}`}
                  index={index + 5}
                  asset={pos.asset}
                  position={pos}
                  activeIndex={activeIndex}
                  onSwap={handleSwap}
                />
              )
            ))}
          </View>
        )}
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  root: {
    // backgroundColor: '#07070F',
    flex: 1,
  },
  container: {
    width: SCREEN_WIDTH,
    minHeight: BOOKSHELF_HEIGHT,
    // backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderRadius: 8,
    marginVertical: 16,
  },
  area: {
    position: 'relative',
    width: SCREEN_WIDTH,
    height: CELL_SIZE * 2,
  },
  item: {
    overflow: 'hidden',
    borderRadius: 4,
    backgroundColor: 'white',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  videoBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  durationText: {
    color: 'white',
    fontSize: 10,
  },
});

export default Bookshelf;