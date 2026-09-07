import React, { createContext, useContext, useState, ReactNode } from 'react';
import { View, Text, Modal, TouchableOpacity, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type ButtonStyle = 'default' | 'cancel' | 'destructive';

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: ButtonStyle;
}

interface AlertState {
  isVisible: boolean;
  title: string;
  message?: string;
  buttons?: AlertButton[];
}

interface CustomAlertContextType {
  showAlert: (title: string, message?: string, buttons?: AlertButton[]) => void;
}

const CustomAlertContext = createContext<CustomAlertContextType | undefined>(undefined);

export const useCustomAlert = () => {
  const context = useContext(CustomAlertContext);
  if (!context) {
    throw new Error('useCustomAlert must be used within a CustomAlertProvider');
  }
  return context;
};

export const CustomAlertProvider = ({ children }: { children: ReactNode }) => {
  const [alertState, setAlertState] = useState<AlertState>({
    isVisible: false,
    title: '',
  });

  const [fadeAnim] = useState(new Animated.Value(0));

  const showAlert = (title: string, message?: string, buttons?: AlertButton[]) => {
    setAlertState({
      isVisible: true,
      title,
      message,
      buttons: buttons || [{ text: 'OK', onPress: hideAlert }],
    });
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const hideAlert = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setAlertState(prev => ({ ...prev, isVisible: false }));
    });
  };

  const handleButtonPress = (onPress?: () => void) => {
    hideAlert();
    if (onPress) {
      setTimeout(() => {
        onPress();
      }, 200); // Wait for hide animation
    }
  };

  return (
    <CustomAlertContext.Provider value={{ showAlert }}>
      {children}
      {alertState.isVisible && (
        <Modal transparent visible={true} animationType="none">
          <View className="flex-1 justify-center items-center px-6">
            <Animated.View 
              style={{ opacity: fadeAnim }} 
              className="absolute inset-0 bg-slate-950/80" 
            />
            
            <Animated.View 
              style={{ 
                opacity: fadeAnim,
                transform: [{
                  scale: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.95, 1],
                  })
                }]
              }}
              className="bg-slate-900 w-full max-w-sm rounded-3xl p-6 border border-slate-800 shadow-2xl shadow-blue-900/20"
            >
              <View className="items-center mb-4">
                <View className="w-12 h-12 rounded-full bg-slate-800 justify-center items-center mb-3">
                  <Ionicons name="alert-circle" size={28} color="#3b82f6" />
                </View>
                <Text className="text-xl font-bold text-white text-center mb-2">{alertState.title}</Text>
                {alertState.message && (
                  <Text className="text-base text-slate-400 text-center leading-relaxed">
                    {alertState.message}
                  </Text>
                )}
              </View>

              <View className={`flex-row justify-end mt-2 ${alertState.buttons && alertState.buttons.length > 2 ? 'flex-col space-y-3' : 'space-x-3'}`}>
                {alertState.buttons?.map((btn, index) => {
                  const isDestructive = btn.style === 'destructive';
                  const isCancel = btn.style === 'cancel';
                  
                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleButtonPress(btn.onPress)}
                      className={`py-3 px-6 rounded-xl justify-center items-center ${
                        isDestructive ? 'bg-red-500/20' : 
                        isCancel ? 'bg-slate-800' : 'bg-blue-600'
                      } ${alertState.buttons && alertState.buttons.length > 2 ? 'w-full' : 'flex-1'}`}
                    >
                      <Text className={`font-bold text-base ${
                        isDestructive ? 'text-red-400' : 
                        isCancel ? 'text-white' : 'text-white'
                      }`}>
                        {btn.text}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Animated.View>
          </View>
        </Modal>
      )}
    </CustomAlertContext.Provider>
  );
};
