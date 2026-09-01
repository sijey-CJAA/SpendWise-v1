import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import * as expenseService from './expenseService';

const SYNC_QUEUE_KEY = '@spendwise_sync_queue';

export type SyncActionType = 
  | 'ADD_EXPENSE' | 'UPDATE_EXPENSE' | 'DELETE_EXPENSE'
  | 'ADD_UPCOMING_PAYMENT' | 'UPDATE_UPCOMING_PAYMENT' | 'DELETE_UPCOMING_PAYMENT'
  | 'ADD_SHARED_EXPENSE' | 'UPDATE_SHARED_EXPENSE' | 'DELETE_SHARED_EXPENSE';

export interface SyncAction {
  id: string;
  type: SyncActionType;
  payload: any;
  timestamp: number;
}

class SyncService {
  private isOnline: boolean = true;
  private isProcessing: boolean = false;

  constructor() {
    this.init();
  }

  private init() {
    NetInfo.addEventListener(state => {
      const wasOffline = !this.isOnline;
      this.isOnline = !!state.isConnected && !!state.isInternetReachable;
      
      if (wasOffline && this.isOnline) {
        this.processQueue();
      }
    });

    NetInfo.fetch().then(state => {
      this.isOnline = !!state.isConnected && !!state.isInternetReachable;
    });
  }

  public getIsOnline(): boolean {
    return this.isOnline;
  }

  public async getQueue(): Promise<SyncAction[]> {
    try {
      const queueStr = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
      if (queueStr) {
        return JSON.parse(queueStr) as SyncAction[];
      }
    } catch (e) {
      console.error("Error reading sync queue:", e);
    }
    return [];
  }

  public async queueAction(type: SyncActionType, payload: any): Promise<void> {
    try {
      const queue = await this.getQueue();
      const newAction: SyncAction = {
        id: Date.now().toString() + Math.random().toString(36).substring(7),
        type,
        payload,
        timestamp: Date.now()
      };
      queue.push(newAction);
      await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
      console.log(`Action queued: ${type}`);
    } catch (e) {
      console.error("Error queueing action:", e);
    }
  }

  public async clearQueue(): Promise<void> {
    try {
      await AsyncStorage.removeItem(SYNC_QUEUE_KEY);
    } catch (e) {
      console.error("Error clearing sync queue:", e);
    }
  }

  public async processQueue(): Promise<void> {
    if (this.isProcessing || !this.isOnline) return;
    this.isProcessing = true;

    try {
      const queue = await this.getQueue();
      if (queue.length === 0) {
        this.isProcessing = false;
        return;
      }

      console.log(`Processing ${queue.length} offline actions...`);
      
      const newQueue = [...queue];

      for (let i = 0; i < queue.length; i++) {
        const action = queue[i];
        try {
          await this.executeAction(action);
          // Remove from new queue on success
          const idx = newQueue.findIndex(a => a.id === action.id);
          if (idx !== -1) newQueue.splice(idx, 1);
        } catch (e: any) {
          console.error(`Failed to process action ${action.id}:`, e);
          // If it's a network error, stop processing and try again later
          if (!this.isOnline) {
            break;
          }
        }
      }

      // Update queue with remaining (failed) actions
      await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(newQueue));
    } catch (e) {
      console.error("Error processing sync queue:", e);
    } finally {
      this.isProcessing = false;
    }
  }

  private async executeAction(action: SyncAction): Promise<void> {
    switch (action.type) {
      case 'ADD_EXPENSE':
        await expenseService.addExpense(action.payload, true);
        break;
      case 'UPDATE_EXPENSE':
        await expenseService.updateExpense(action.payload.id, action.payload.data, true);
        break;
      case 'DELETE_EXPENSE':
        await expenseService.deleteExpense(action.payload.id, true);
        break;
      case 'ADD_UPCOMING_PAYMENT':
        await expenseService.addUpcomingPayment(action.payload, true);
        break;
      case 'UPDATE_UPCOMING_PAYMENT':
        await expenseService.updateUpcomingPayment(action.payload.id, action.payload.data, true);
        break;
      case 'DELETE_UPCOMING_PAYMENT':
        await expenseService.deleteUpcomingPayment(action.payload.id, true);
        break;
      case 'ADD_SHARED_EXPENSE':
        await expenseService.addSharedExpense(action.payload, true);
        break;
      case 'UPDATE_SHARED_EXPENSE':
        await expenseService.updateSharedExpense(action.payload.id, action.payload.data, true);
        break;
      case 'DELETE_SHARED_EXPENSE':
        await expenseService.deleteSharedExpense(action.payload.id, true);
        break;
      default:
        console.warn('Unknown sync action type:', action.type);
    }
  }
}

export const syncService = new SyncService();
