import * as FileSystem from 'expo-file-system';
import { shareAsync } from 'expo-sharing';
import React from 'react';
import { Share, Text, TouchableOpacity } from 'react-native';

interface ShareButtonProps {
  content: {
    text?: string;
    url?: string;
    imageUri?: string;
    title?: string; // 分享弹窗标题
  };
}

export const ShareButton = ({ content }: ShareButtonProps) => {
  const handleShare = async () => {
    try {
      // 处理不同类型的内容分享
      if (content.imageUri) {
        // 如果是本地图片需要先保存到缓存
        const localUri = await FileSystem.downloadAsync(
          content.imageUri,
          FileSystem.cacheDirectory + 'shared_image.jpg'
        );
        
        await shareAsync(localUri.uri, {
          mimeType: 'image/jpeg',
          dialogTitle: content.title || '分享图片',
        });
      } else {
        // 通用分享（文本/链接）
        const result = await Share.share(
          {
            title: content.title,
            message: content.text || '',
            url: content.url || '',
          },
          {
            dialogTitle: content.title || '分享内容',
            subject: content.text, // iOS 邮件专用
          }
        );

        if (result.action === Share.sharedAction) {
          console.log('分享成功');
        } else if (result.action === Share.dismissedAction) {
          console.log('用户取消分享');
        }
      }
    } catch (error) {
      console.error('分享失败:', error);
    }
  };

  return (
    <TouchableOpacity onPress={handleShare}>
      <Text>分享</Text>
    </TouchableOpacity>
  );
};