import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import Constants from 'expo-constants';
import { auth, db, app } from '../config/firebase';
import { 
  getDiagnosticsState, 
  testFirebaseConnection, 
  testFirestoreWrite, 
  handleAppError 
} from '../services/errorHandler';

interface DeveloperDiagnosticsModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function DeveloperDiagnosticsModal({ visible, onClose }: DeveloperDiagnosticsModalProps) {
  const [diagnostics, setDiagnostics] = useState(getDiagnosticsState());
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionResult, setConnectionResult] = useState<{ success: boolean; message: string; code?: string } | null>(null);

  const [testingWrite, setTestingWrite] = useState(false);
  const [writeResult, setWriteResult] = useState<{ success: boolean; message: string; documentPath?: string; code?: string } | null>(null);

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (visible) {
      setDiagnostics(getDiagnosticsState());
      setConnectionResult(null);
      setWriteResult(null);
      setCopied(false);
    }
  }, [visible]);

  if (!visible) return null;

  const user = auth.currentUser;
  const projectId = (app?.options as any)?.projectId || process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'spendwise-26986';
  const appId = (app?.options as any)?.appId || '1:767926524621:web:11502fac5d947abc362784';
  const appVersion = Constants.expoConfig?.version || '2.0.4';
  const environment = __DEV__ ? 'Development (Metro)' : 'Android Release APK';

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setConnectionResult(null);
    try {
      const res = await testFirebaseConnection();
      setConnectionResult(res);
      setDiagnostics(getDiagnosticsState());
    } finally {
      setTestingConnection(false);
    }
  };

  const handleTestWrite = async () => {
    setTestingWrite(true);
    setWriteResult(null);
    try {
      const res = await testFirestoreWrite();
      setWriteResult(res);
      setDiagnostics(getDiagnosticsState());
    } finally {
      setTestingWrite(false);
    }
  };

  const handleTriggerTestError = () => {
    handleAppError(
      new Error('Test Firestore error triggered manually by user to verify DebugErrorModal.'),
      {
        category: 'Firestore Write',
        operation: 'Manual Error Test',
        target: 'expenses/test_error_doc',
      }
    );
  };

  const handleCopyReport = async () => {
    const reportText = [
      '========================================',
      '     SPENDWISE DIAGNOSTIC REPORT',
      '========================================',
      `App Version         : ${appVersion}`,
      `Platform            : ${Platform.OS.toUpperCase()} (API ${Platform.Version || 'N/A'})`,
      `Environment         : ${environment}`,
      `Network Connected   : ${diagnostics.isOnline ? 'YES' : 'NO'}`,
      '----------------------------------------',
      `Firebase Inited     : ${diagnostics.firebaseInitialized ? 'YES' : 'NO'}`,
      `Firestore Inited    : ${diagnostics.firestoreInitialized ? 'YES' : 'NO'}`,
      `Project ID          : ${projectId}`,
      `App ID              : ${appId}`,
      '----------------------------------------',
      `Authenticated       : ${user ? 'YES' : 'NO'}`,
      `User UID            : ${user?.uid || 'None'}`,
      `User Email          : ${user?.email || 'None'}`,
      '----------------------------------------',
      `Last Firestore Read : ${diagnostics.lastSuccessfulRead || 'None recorded'}`,
      `Last Firestore Write: ${diagnostics.lastSuccessfulWrite || 'None recorded'}`,
      diagnostics.lastSuccessfulWriteTarget ? `Last Write Target   : ${diagnostics.lastSuccessfulWriteTarget}` : null,
      diagnostics.lastError ? `Last Error          : [${diagnostics.lastError.category}] ${diagnostics.lastError.message}` : 'Last Error: None',
      '========================================',
    ].filter(Boolean).join('\n');

    await Clipboard.setStringAsync(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View className="flex-1 bg-black/80 justify-center items-center px-4 py-8">
        <View 
          className="w-full max-w-lg bg-slate-900 rounded-3xl border border-slate-700 shadow-2xl overflow-hidden flex-col" style={{ height: '85%' }}
        >
          {/* Header */}
          <View className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/40 justify-center items-center mr-3">
                <Ionicons name="construct-outline" size={22} color="#60a5fa" />
              </View>
              <View>
                <Text className="text-white text-lg font-bold">Firebase Diagnostics</Text>
                <Text className="text-slate-400 text-xs">Developer & Connection Info</Text>
              </View>
            </View>
            <TouchableOpacity 
              onPress={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 justify-center items-center border border-slate-700 active:bg-slate-700"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={18} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          {/* Body */}
          <ScrollView 
            className="flex-1 px-6 py-4"
            showsVerticalScrollIndicator={true}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {/* System Info Table */}
            <View className="bg-slate-950 p-4 rounded-2xl border border-slate-800 mb-4 space-y-2.5">
              <Text className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
                Environment & Status
              </Text>

              <View className="flex-row justify-between items-center py-1 border-b border-slate-800/80">
                <Text className="text-slate-400 text-xs">App Version:</Text>
                <Text className="text-white text-xs font-mono font-semibold">v{appVersion}</Text>
              </View>

              <View className="flex-row justify-between items-center py-1 border-b border-slate-800/80">
                <Text className="text-slate-400 text-xs">Environment:</Text>
                <View className="bg-slate-800 px-2 py-0.5 rounded">
                  <Text className="text-blue-300 text-xs font-mono">{environment}</Text>
                </View>
              </View>

              <View className="flex-row justify-between items-center py-1 border-b border-slate-800/80">
                <Text className="text-slate-400 text-xs">Platform:</Text>
                <Text className="text-white text-xs font-mono">{Platform.OS.toUpperCase()} (API {Platform.Version || 'N/A'})</Text>
              </View>

              <View className="flex-row justify-between items-center py-1 border-b border-slate-800/80">
                <Text className="text-slate-400 text-xs">Internet Reachable:</Text>
                <Text className={`text-xs font-bold ${diagnostics.isOnline ? 'text-emerald-400' : 'text-red-400'}`}>
                  {diagnostics.isOnline ? 'YES' : 'NO (Offline)'}
                </Text>
              </View>

              <View className="flex-row justify-between items-center py-1 border-b border-slate-800/80">
                <Text className="text-slate-400 text-xs">Firebase Project ID:</Text>
                <Text className="text-white text-xs font-mono">{projectId}</Text>
              </View>

              <View className="flex-row justify-between items-center py-1 border-b border-slate-800/80">
                <Text className="text-slate-400 text-xs">Firestore Active:</Text>
                <Text className={`text-xs font-bold ${diagnostics.firestoreInitialized ? 'text-emerald-400' : 'text-red-400'}`}>
                  {diagnostics.firestoreInitialized ? 'YES (Long-Polling)' : 'NO'}
                </Text>
              </View>

              <View className="flex-row justify-between items-center py-1 border-b border-slate-800/80">
                <Text className="text-slate-400 text-xs">Auth Status:</Text>
                <Text className={`text-xs font-bold ${user ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {user ? 'AUTHENTICATED' : 'NOT LOGGED IN'}
                </Text>
              </View>

              <View className="flex-row justify-between items-center py-1 border-b border-slate-800/80">
                <Text className="text-slate-400 text-xs">Current User UID:</Text>
                <Text className="text-white text-xs font-mono truncate max-w-[200px]" numberOfLines={1}>
                  {user?.uid || 'None'}
                </Text>
              </View>

              <View className="flex-row justify-between items-center py-1 border-b border-slate-800/80">
                <Text className="text-slate-400 text-xs">Last Successful Read:</Text>
                <Text className="text-slate-300 text-xs font-mono">{diagnostics.lastSuccessfulRead || 'None yet'}</Text>
              </View>

              <View className="flex-row justify-between items-center py-1">
                <Text className="text-slate-400 text-xs">Last Successful Write:</Text>
                <Text className="text-slate-300 text-xs font-mono">{diagnostics.lastSuccessfulWrite || 'None yet'}</Text>
              </View>
            </View>

            {/* Test Connection Button & Result */}
            <View className="bg-slate-950 p-4 rounded-2xl border border-slate-800 mb-4">
              <Text className="text-white text-sm font-bold mb-1">1. Test Firestore Connection</Text>
              <Text className="text-slate-400 text-xs mb-3">
                Executes a harmless Firestore read to check if queries succeed.
              </Text>
              
              <TouchableOpacity
                onPress={handleTestConnection}
                disabled={testingConnection}
                className="h-11 rounded-xl bg-blue-600 justify-center items-center active:bg-blue-700 flex-row"
              >
                {testingConnection ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <>
                    <Ionicons name="cloud-download-outline" size={18} color="#ffffff" />
                    <Text className="text-white font-bold text-sm ml-2">Test Firebase Connection</Text>
                  </>
                )}
              </TouchableOpacity>

              {connectionResult && (
                <View className={`mt-3 p-3 rounded-xl border ${connectionResult.success ? 'bg-emerald-950/40 border-emerald-500/40' : 'bg-red-950/40 border-red-500/40'}`}>
                  <Text className={`font-bold text-xs ${connectionResult.success ? 'text-emerald-400' : 'text-red-400'}`}>
                    {connectionResult.success ? 'SUCCESS' : 'FAILED'}
                  </Text>
                  <Text className="text-slate-200 text-xs mt-1">
                    {connectionResult.message}
                  </Text>
                  {connectionResult.code && (
                    <Text className="text-red-400 text-[11px] font-mono mt-1">
                      Code: {connectionResult.code}
                    </Text>
                  )}
                </View>
              )}
            </View>

            {/* Test Write Button & Result */}
            <View className="bg-slate-950 p-4 rounded-2xl border border-slate-800 mb-4">
              <Text className="text-white text-sm font-bold mb-1">2. Test Firestore Write</Text>
              <Text className="text-slate-400 text-xs mb-3">
                Writes and automatically deletes a test document in debug_diagnostics.
              </Text>
              
              <TouchableOpacity
                onPress={handleTestWrite}
                disabled={testingWrite}
                className="h-11 rounded-xl bg-emerald-700 justify-center items-center active:bg-emerald-800 flex-row"
              >
                {testingWrite ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <>
                    <Ionicons name="cloud-upload-outline" size={18} color="#ffffff" />
                    <Text className="text-white font-bold text-sm ml-2">Test Firestore Write</Text>
                  </>
                )}
              </TouchableOpacity>

              {writeResult && (
                <View className={`mt-3 p-3 rounded-xl border ${writeResult.success ? 'bg-emerald-950/40 border-emerald-500/40' : 'bg-red-950/40 border-red-500/40'}`}>
                  <Text className={`font-bold text-xs ${writeResult.success ? 'text-emerald-400' : 'text-red-400'}`}>
                    {writeResult.success ? 'SUCCESS' : 'FAILED'}
                  </Text>
                  <Text className="text-slate-200 text-xs mt-1">
                    {writeResult.message}
                  </Text>
                  {writeResult.documentPath && (
                    <Text className="text-slate-400 text-[11px] font-mono mt-1">
                      Doc: {writeResult.documentPath}
                    </Text>
                  )}
                  {writeResult.code && (
                    <Text className="text-red-400 text-[11px] font-mono mt-1">
                      Code: {writeResult.code}
                    </Text>
                  )}
                </View>
              )}
            </View>

            {/* Trigger Error Test */}
            <View className="bg-slate-950 p-4 rounded-2xl border border-slate-800 mb-2">
              <Text className="text-white text-sm font-bold mb-1">3. Test Debug Error Modal</Text>
              <Text className="text-slate-400 text-xs mb-3">
                Manually triggers an error to test the DebugErrorModal pop-up behavior.
              </Text>
              
              <TouchableOpacity
                onPress={handleTriggerTestError}
                className="h-11 rounded-xl bg-amber-600/30 border border-amber-500/40 justify-center items-center active:bg-amber-600/50 flex-row"
              >
                <Ionicons name="bug-outline" size={18} color="#fbbf24" />
                <Text className="text-amber-400 font-bold text-sm ml-2">Trigger Test Error Modal</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View className="p-4 bg-slate-950 border-t border-slate-800 flex-row gap-3">
            <TouchableOpacity 
              onPress={handleCopyReport}
              className={`flex-1 h-12 rounded-xl flex-row justify-center items-center border ${copied ? 'bg-emerald-600/30 border-emerald-500' : 'bg-slate-800 border-slate-700 active:bg-slate-700'}`}
              activeOpacity={0.8}
            >
              <Ionicons 
                name={copied ? 'checkmark' : 'copy-outline'} 
                size={18} 
                color={copied ? '#34d399' : '#ffffff'} 
              />
              <Text className={`font-bold text-sm ml-2 ${copied ? 'text-emerald-400' : 'text-white'}`}>
                {copied ? 'Copied Report!' : 'Copy Diagnostics'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={onClose}
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
