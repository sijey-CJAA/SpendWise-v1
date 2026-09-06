import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function UpdateModal() {
  const [isVisible, setIsVisible] = useState(false);
  const [releaseUrl, setReleaseUrl] = useState('');
  const [latestVersion, setLatestVersion] = useState('');

  useEffect(() => {
    checkForUpdates();
  }, []);

  const checkForUpdates = async () => {
    try {
      // Get current version from app.json via Constants
      const currentVersion = Constants.expoConfig?.version || '1.0.0';
      
      const response = await fetch('https://api.github.com/repos/sijey-CJAA/SpendWise-v1/releases/latest');
      if (!response.ok) return;
      
      const data = await response.json();
      
      let fetchedTag = data.tag_name || '';
      // Strip 'v' prefix if present
      if (fetchedTag.startsWith('v')) {
        fetchedTag = fetchedTag.substring(1);
      }
      
      // Compare versions (major.minor.patch)
      const isNewer = compareVersions(fetchedTag, currentVersion) > 0;
      
      if (isNewer) {
        // Only show once per day if user hits "Maybe Later"
        const lastPrompted = await AsyncStorage.getItem('@update_prompted_date');
        const today = new Date().toISOString().split('T')[0];
        
        if (lastPrompted !== today) {
          setLatestVersion(fetchedTag);
          setReleaseUrl(data.html_url);
          setIsVisible(true);
        }
      }
    } catch (error) {
      console.log('Error checking for updates:', error);
    }
  };

  const compareVersions = (v1: string, v2: string) => {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const p1 = parts1[i] || 0;
      const p2 = parts2[i] || 0;
      if (p1 > p2) return 1;
      if (p1 < p2) return -1;
    }
    return 0;
  };

  const handleMaybeLater = async () => {
    const today = new Date().toISOString().split('T')[0];
    await AsyncStorage.setItem('@update_prompted_date', today);
    setIsVisible(false);
  };

  const handleUpdateNow = () => {
    if (releaseUrl) {
      Linking.openURL(releaseUrl);
    }
    setIsVisible(false);
  };

  return (
    <Modal visible={isVisible} transparent={true} animationType="fade">
      <View className="flex-1 justify-center items-center bg-black/60 px-6">
        <View className="bg-brand-card-bg w-full max-w-sm rounded-[24px] border border-white/20 p-6 items-center shadow-lg">
          <View className="w-16 h-16 rounded-full bg-blue-500/20 justify-center items-center mb-4">
            <Ionicons name="cloud-download-outline" size={32} color="#3b82f6" />
          </View>
          <Text className="text-[20px] text-white font-bold mb-2 text-center">Update Available!</Text>
          <Text className="text-[14px] text-gray-400 text-center mb-6">
            Version {latestVersion} is now available. You are currently on version {Constants.expoConfig?.version || '1.0.0'}. Would you like to update now?
          </Text>
          <View className="flex-row gap-3 w-full">
            <TouchableOpacity
              className="flex-1 py-3 rounded-xl border border-[#444] justify-center items-center"
              onPress={handleMaybeLater}
              activeOpacity={0.7}
            >
              <Text className="text-white font-bold">Maybe Later</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 py-3 rounded-xl bg-[#2563eb] justify-center items-center"
              onPress={handleUpdateNow}
              activeOpacity={0.8}
            >
              <Text className="text-white font-bold">Update Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
