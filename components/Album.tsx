import * as MediaLibrary from 'expo-media-library';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';


// MediaAsset接口定义
// 该接口用于描述媒体资源的基本信息，包括ID、URI、文件名、媒体类型、持续时间和创建时间等属性
export interface MediaAsset {
  id: string;   // 媒体资源的唯一标识符
  uri: string;  // 媒体资源的URI，用于访问该资源
  filename: string; // 媒体资源的文件名
  mediaType: 'photo' | 'video'; // 媒体资源的类型，可能是照片或视频
  duration: number; // 媒体资源的持续时间（仅对视频有效）
  creationTime: number; // 媒体资源的创建时间戳
  index?: number;   // 媒体资源在选择列表中的索引（可选）
  type?: string;    // 媒体资源的类型（可选）
}

// AlbumPicker组件的属性定义
// 该组件用于选择相册中的媒体资源，包含确认和取消操作的回调函数以及可选的容器高度属性
interface AlbumPickerProps {
  onConfirm: (assets: MediaAsset[], isEnd: boolean) => void;    // 确认选择的回调函数，接收选中的媒体资源数组作为参数
  onCancel: () => void; // 取消选择的回调函数
  containerHeight?: number; // 新增高度属性 （可选），用于设置组件容器的高度
  maxSelection?: number; // 新增最大选择数参数
  live?: boolean; // 新增live属性 （可选），用于设置组件是否为实时选择模式
  currentAssets?: MediaAsset[]; // 新增当前选中资源属性 （可选），用于设置组件的初始选中状态
}

const screenWidth = Dimensions.get('window').width;
const itemSize = screenWidth / 4;

// AlbumPicker组件的定义 Props属性类型为 
const AlbumPicker = ({ onConfirm, onCancel, containerHeight, maxSelection = 13, live=false, currentAssets=[]}: AlbumPickerProps) => {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [selectedAssets, setSelectedAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [endCursor, setEndCursor] = useState<string>('');
  const [hasNextPage, setHasNextPage] = useState(true);



// loadAssets函数用于加载媒体资源
  const loadAssets = async (initialLoad = true) => {
    try {
      const { status, canAskAgain } = await MediaLibrary.requestPermissionsAsync();
      
      if (status !== 'granted') {
        if (!canAskAgain) {
          Alert.alert(
            'Permission Required',
            'Please enable photo library access in settings',
            [
              { text: 'Cancel', onPress: onCancel },
              { text: 'Open Settings', onPress: () => Linking.openSettings() }
            ]
          );
        }
        return;
      }

      const media = await MediaLibrary.getAssetsAsync({
        first: 50,
        after: initialLoad ? undefined : endCursor,
        mediaType: ['photo', 'video'],
        sortBy: [MediaLibrary.SortBy.creationTime],
      });

      const processedAssets = media.assets.map(asset => ({
        id: asset.id,
        uri: Platform.OS === 'android' ? asset.uri : asset.uri,
        filename: asset.filename || 'untitled',
        mediaType: (asset.mediaType === MediaLibrary.MediaType.video ? 'video' : 'photo') as 'photo' | 'video',
        duration: asset.duration || 0,
        creationTime: asset.creationTime,
      }));

      setAssets(prev => initialLoad ? processedAssets : [...prev, ...processedAssets]);
      setEndCursor(media.endCursor);
      setHasNextPage(media.hasNextPage);
    } catch (error) {
      console.error('Media load error:', error);
      Alert.alert('Error', 'Failed to load media');
    } finally {
      setLoading(false);
    }
  };

  // 组件加载时请求权限并加载媒体资源
  useEffect(() => {
    loadAssets(true);
    if(currentAssets?.length) {
      setSelectedAssets(currentAssets);
    }
  }, []);


  // 组件更新时加载更多媒体资源
  const toggleSelection = (asset: MediaAsset) => {
    // 检查是否已达最大选择数量
    if (selectedAssets.length >= maxSelection && 
        !selectedAssets.some(a => a.uri === asset.uri)) {
      Alert.alert(
        `最多选择 ${maxSelection} 个项目`,
        `你只能选择不超过 ${maxSelection} 个照片或视频`,
        [{ text: 'OK' }]
      );
      return;
    }

    // 检查是否已选择该资源
    // 如果已选择，则取消选择；如果未选择，则添加到选中列表
    const index = selectedAssets.findIndex(a => a.uri === asset.uri);
    let newSelected = [...selectedAssets];
    
    if (index === -1) {
      newSelected = [...selectedAssets, { ...asset, index: selectedAssets.length + 1 }];
    } else {
      newSelected = newSelected.filter(a => a.uri !== asset.uri)
        .map((a, idx) => ({ ...a, index: idx + 1 }));
    }
    
    setSelectedAssets(newSelected);
    console.log('Selected assets:', newSelected.length, live);
    
    if (live===true) { 
      onConfirm(newSelected, false);
    }
  };


  // 渲染每个媒体资源的函数
  const renderItem = ({ item }: { item: MediaAsset }) => {
    const isSelected = selectedAssets.some(a => a.uri === item.uri);
    const isDisabled = selectedAssets.length >= maxSelection && !isSelected;

    return(
        // 选中状态下的样式
        <TouchableOpacity
        style={styles.itemContainer}
        onPress={() => toggleSelection(item)}
        >
            {isDisabled && (
            <View style={styles.disabledOverlay} />
            )}
            {/* 媒体资源的缩略图 */}
            <Image 
                source={{ uri: item.uri }} 
                style={styles.thumbnail}
                resizeMode="cover"
            />
            {/* 视频资源的时长显示 */}
            {item.mediaType === 'video' && (
                <View style={styles.durationBadge}>
                    <Text style={styles.durationText}>
                        {formatDuration(item.duration)}
                    </Text>
                </View>
            )}
            {/* 选中状态下的标记 */}
            <View style={[
                styles.selectionBadge,
                selectedAssets.some(a => a.uri === item.uri) && styles.selectedBadge
            ]}>
                <Text style={styles.selectionText}>
                    {selectedAssets.find(a => a.uri === item.uri)?.index}
                </Text>
            </View>
        </TouchableOpacity>
    );}

  return (
    <View style={[styles.container, containerHeight ? { height: containerHeight } : {}]}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <>
          <FlatList
            data={assets}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            numColumns={4}
            onEndReached={() => hasNextPage && loadAssets(false)}
            onEndReachedThreshold={0.5}
            contentContainerStyle={styles.listContent}
            ListFooterComponent={hasNextPage ? (
              <ActivityIndicator style={{ padding: 10 }} />
            ) : null}
          />
          
          <View style={styles.footer}>
            <TouchableOpacity onPress={onCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={() => onConfirm(selectedAssets, true)}
              // disabled={selectedAssets.length === 0} // 不允许没有选中时使用按钮
            >
              <Text style={styles.confirmText}>
                Confirm ({selectedAssets.length})
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const styles = StyleSheet.create({
  container: {
    height: 300,
    // flex: 1,
    backgroundColor: 'white'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  listContent: {
    paddingBottom: 60,
    minHeight: 100 // 确保滚动容器有最小高度
  },
  itemContainer: {
    width: itemSize,
    height: itemSize,
    padding: 2
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 4
  },
  disabledOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 4,
    zIndex: 2
  },
  durationBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 2
  },
  durationText: {
    color: 'white',
    fontSize: 10,
    includeFontPadding: false
  },
  selectionBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent'
  },
  selectedBadge: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3'
  },
  selectionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold'
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#ddd'
  },
  cancelText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500'
  },
  confirmButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    opacity: 1
  },
  confirmText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  }
});

export default AlbumPicker;