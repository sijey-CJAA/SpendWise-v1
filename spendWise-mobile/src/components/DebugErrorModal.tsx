import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { 
  AppErrorDetails, 
  subscribeToDebugErrors, 
  dismissDebugModal, 
  copyDebugReportToClipboard 
} from '../services/errorHandler';

export default function DebugErrorModal() {
  const [errorDetails, setErrorDetails] = useState<AppErrorDetails | null>(null);
  const [showStack, setShowStack] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToDebugErrors((error) => {
      setErrorDetails(error);
      setShowStack(false);
      setCopied(false);
    });
    return () => unsubscribe();
  }, []);

  if (!errorDetails) return null;

  const handleCopy = async () => {
    const success = await copyDebugReportToClipboard(errorDetails);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const isFirestore = errorDetails.category.includes('Firestore');
  const isAuth = errorDetails.category.includes('Auth');

  const badgeColor = isFirestore 
    ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
    : isAuth 
    ? 'bg-blue-500/20 text-blue-400 border-blue-500/40' 
    : 'bg-red-500/20 text-red-400 border-red-500/40';

  return (
    <Modal
      visible={!!errorDetails}
      transparent={true}
      animationType="fade"
      onRequestClose={dismissDebugModal}
      statusBarTranslucent={true}
    >
      <View className="flex-1 bg-black/80 justify-center items-center px-4 py-8">
        <View 
          className="w-full max-w-lg bg-slate-900 rounded-3xl border border-red-500/40 shadow-2xl overflow-hidden flex-col max-h-[90%]"
          style={{ shadowColor: '#ef4444', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 15, elevation: 25 }}
        >
          {/* Header */}
          <View className="bg-red-950/60 border-b border-red-500/30 px-6 py-4 flex-row items-center justify-between">
            <View className="flex-row items-center flex-1 mr-2">
              <View className="w-10 h-10 rounded-full bg-red-500/20 border border-red-500/40 justify-center items-center mr-3">
                <Ionicons name="alert-circle" size={24} color="#f87171" />
              </View>
              <View className="flex-1">
                <Text className="text-red-400 text-xs font-bold tracking-wider uppercase">
                  Application Debug Error
                </Text>
                <Text className="text-white text-base font-bold truncate" numberOfLines={1}>
                  {errorDetails.operation}
                </Text>
              </View>
            </View>
            <TouchableOpacity 
              onPress={dismissDebugModal}
              className="w-8 h-8 rounded-full bg-slate-800 justify-center items-center border border-slate-700 active:bg-slate-700"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={18} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          {/* Scrollable Body */}
          <ScrollView 
            className="flex-1 px-6 py-4"
            showsVerticalScrollIndicator={true}
            contentContainerStyle={{ paddingBottom: 16 }}
          >
            {/* Category & Status Badges */}
            <View className="flex-row flex-wrap gap-2 mb-4">
              <View className={`px-3 py-1 rounded-full border ${badgeColor}`}>
                <Text className="text-xs font-semibold">{errorDetails.category}</Text>
              </View>
              <View className={`px-3 py-1 rounded-full border ${errorDetails.isAuthenticated ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border-rose-500/30'}`}>
                <Text className={`text-xs font-semibold ${errorDetails.isAuthenticated ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {errorDetails.isAuthenticated ? '✓ Authenticated' : '✕ Not Authenticated'}
                </Text>
              </View>
              <View className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700">
                <Text className="text-slate-300 text-xs font-medium">{errorDetails.environment}</Text>
              </View>
            </View>

            {/* Human Explanation Box */}
            <View className="bg-slate-950 p-4 rounded-2xl border border-slate-800 mb-4">
              <Text className="text-slate-400 text-xs font-semibold mb-1 uppercase tracking-wide">
                Message
              </Text>
              <Text className="text-white text-sm leading-relaxed font-medium">
                {errorDetails.message}
              </Text>
            </View>

            {/* Error Code & Details Grid */}
            <View className="bg-slate-950 p-4 rounded-2xl border border-slate-800 mb-4 space-y-3">
              {errorDetails.firebaseCode && (
                <View className="flex-row justify-between items-center pb-2 border-b border-slate-800/80">
                  <Text className="text-slate-400 text-xs font-medium">Firebase Code:</Text>
                  <View className="bg-red-500/10 px-2 py-0.5 rounded border border-red-500/30">
                    <Text className="text-red-400 text-xs font-mono font-bold">
                      {errorDetails.firebaseCode}
                    </Text>
                  </View>
                </View>
              )}

              {errorDetails.target && (
                <View className="flex-row justify-between items-center pb-2 border-b border-slate-800/80">
                  <Text className="text-slate-400 text-xs font-medium">Target Path:</Text>
                  <Text className="text-slate-200 text-xs font-mono">
                    {errorDetails.target}
                  </Text>
                </View>
              )}

              <View className="flex-row justify-between items-center pb-2 border-b border-slate-800/80">
                <Text className="text-slate-400 text-xs font-medium">User UID:</Text>
                <Text className="text-slate-200 text-xs font-mono truncate max-w-[200px]" numberOfLines={1}>
                  {errorDetails.userUid || 'None'}
                </Text>
              </View>

              <View className="flex-row justify-between items-center pb-2 border-b border-slate-800/80">
                <Text className="text-slate-400 text-xs font-medium">Firebase Project:</Text>
                <Text className="text-slate-200 text-xs font-mono">
                  {errorDetails.projectId || 'N/A'}
                </Text>
              </View>

              <View className="flex-row justify-between items-center pb-2 border-b border-slate-800/80">
                <Text className="text-slate-400 text-xs font-medium">Timestamp:</Text>
                <Text className="text-slate-200 text-xs font-mono">
                  {errorDetails.timestamp}
                </Text>
              </View>

              <View className="flex-row justify-between items-center">
                <Text className="text-slate-400 text-xs font-medium">App Version / OS:</Text>
                <Text className="text-slate-200 text-xs font-mono">
                  v{errorDetails.appVersion} • {errorDetails.platform}
                </Text>
              </View>
            </View>

            {/* Expandable Technical Details */}
            <View className="mb-2">
              <TouchableOpacity 
                onPress={() => setShowStack(!showStack)}
                className="flex-row items-center justify-between py-2 px-1"
                activeOpacity={0.7}
              >
                <Text className="text-blue-400 text-xs font-semibold">
                  {showStack ? 'Hide Technical Stack Details' : 'Show Technical Stack Details'}
                </Text>
                <Ionicons 
                  name={showStack ? 'chevron-up' : 'chevron-down'} 
                  size={16} 
                  color="#60a5fa" 
                />
              </TouchableOpacity>

              {showStack && (
                <View className="bg-black/60 p-3 rounded-xl border border-slate-800 mt-2">
                  <Text className="text-red-300 text-xs font-mono mb-2">
                    {errorDetails.firebaseMessage || errorDetails.message}
                  </Text>
                  <Text className="text-slate-500 text-[10px] font-mono leading-tight">
                    {errorDetails.stack || 'No stack trace captured.'}
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Bottom Actions */}
          <View className="p-4 bg-slate-950 border-t border-slate-800 flex-row gap-3">
            <TouchableOpacity 
              onPress={handleCopy}
              className={`flex-1 h-12 rounded-xl flex-row justify-center items-center border ${copied ? 'bg-emerald-600/30 border-emerald-500' : 'bg-slate-800 border-slate-700 active:bg-slate-700'}`}
              activeOpacity={0.8}
            >
              <Ionicons 
                name={copied ? 'checkmark' : 'copy-outline'} 
                size={18} 
                color={copied ? '#34d399' : '#ffffff'} 
                className="mr-2" 
              />
              <Text className={`font-bold text-sm ml-2 ${copied ? 'text-emerald-400' : 'text-white'}`}>
                {copied ? 'Copied to Clipboard!' : 'Copy Debug Report'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={dismissDebugModal}
              className="h-12 px-6 rounded-xl bg-blue-600 justify-center items-center active:bg-blue-700"
              activeOpacity={0.8}
            >
              <Text className="text-white font-bold text-sm">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
