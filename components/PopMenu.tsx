import React, { FC, useCallback, useState } from 'react';
import {
  LayoutRectangle,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle
} from 'react-native';

interface ButtonLayout extends LayoutRectangle {}


interface MenuOption {
    label: string;      // 按钮显示文本
    onPress: () => void;// 点击回调
    icon?: React.ReactNode; // 可选图标[7](@ref)
}
  
interface PopMenuProps {
    options: MenuOption[];  // 接收按钮配置数组
    triggerStyle?: ViewStyle; // 触发按钮样式[7](@ref)
    menuWidth?: number;     // 菜单宽度定制[7](@ref)
  }

  const PopMenu: FC<PopMenuProps> = ({ options=[] , triggerStyle, menuWidth }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [buttonLayout, setButtonLayout] = useState<ButtonLayout>({
    x: 0,
    y: 0,
    width: 0,
    height: 0
  });

//   const options: string[] = ['Edit1', 'Share', 'Delete', 'Report'];
 
  //   动态捕捉触发按钮的布局变化，并驱动弹出菜单的精准定位
  const handleRef = useCallback((ref: any | null) => {
    ref?.measureInWindow((x: number, y: number, width: number, height: number) => {
      if (
        x !== buttonLayout.x ||
        y !== buttonLayout.y ||
        width !== buttonLayout.width ||
        height !== buttonLayout.height
      ) {
        setButtonLayout({ x, y, width, height });
      }
    });
  }, [buttonLayout]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <TouchableOpacity
        ref={handleRef}
        onPress={() => setMenuVisible(true)}
      >
        <Text className='text-myPriFont mb-3' style={{ fontSize: 24 }}>⋯</Text>
      </TouchableOpacity>

      <Modal visible={menuVisible} transparent animationType="fade">
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View
            style={[
              styles.menuContainer,
              {
                top: buttonLayout.y + buttonLayout.height + 8,
                left: buttonLayout.x - 100,
                ...Platform.select({
                  ios: {
                    borderRadius: 10,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                  },
                  android: {
                    elevation: 6,
                    borderRadius: 6,
                  },
                }),
              },
            ]}
          >
            {options.map((option) => (
              <TouchableOpacity
                key={option.label}
                style={styles.optionItem}
                onPress={() => {
                    option.onPress(); // 执行点击回调
                    console.log(`Selected: ${option}`);
                    setMenuVisible(false);
                }}
              >
                <Text style={styles.optionText}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  menuContainer: {
    position: 'absolute',
    backgroundColor: '#07070F',
    width: 150,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgb(28, 10, 56)',
  } as const,
  optionItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  } as const,
  optionText: {
    fontSize: 16,
    color: Platform.OS === 'ios' ? '#5E5BE6' : '#5E5BE6',
  } as const,
});

export default PopMenu;
