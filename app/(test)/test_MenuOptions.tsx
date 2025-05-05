import PopMenu from '@/components/PopMenu';
import React from 'react';
import { View } from 'react-native';

interface MenuOption {
    label: string;      // 按钮显示文本
    onPress: () => void;// 点击回调
    icon?: React.ReactNode; // 可选图标[7](@ref)
}

const test_MenuOptions = () => {

    const options: MenuOption[] = [
        { label: 'Edit1', onPress: () => console.log('Edit1') },
        { label: 'Share', onPress: () => console.log('Share') },
        { label: 'Delete', onPress: () => console.log('Delete') },
        { label: 'Report', onPress: () => console.log('Report') },
    ];

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <PopMenu options={options} triggerStyle={{ width: 50, height: 50, backgroundColor: 'red' }} menuWidth={100} />
    </View>
  )
}

export default test_MenuOptions