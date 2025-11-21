import { 
  collection, 
  addDoc, 
  setDoc, 
  doc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  deleteDoc,
  updateDoc
} from 'firebase/firestore';
import { db } from './firebase';

// ============== ADMIN USERS ==============
export const createAdminUser = async (admin: any) => {
  try {
    const docRef = await addDoc(collection(db, 'admin_users'), {
      ...admin,
      createdAt: Timestamp.now(),
      lastLogin: null,
      loginCount: 0,
      status: 'active',
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating admin:', error);
    throw error;
  }
};

export const getAllAdmins = async () => {
  try {
    const q = query(
      collection(db, 'admin_users'),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching admins:', error);
    throw error;
  }
};

export const updateAdminUser = async (adminId: string, updates: any) => {
  try {
    const adminRef = doc(db, 'admin_users', adminId);
    await updateDoc(adminRef, updates);
  } catch (error) {
    console.error('Error updating admin:', error);
    throw error;
  }
};

export const deleteAdminUser = async (adminId: string) => {
  try {
    await deleteDoc(doc(db, 'admin_users', adminId));
  } catch (error) {
    console.error('Error deleting admin:', error);
    throw error;
  }
};

// ============== ACTIVITY LOGS ==============
export const logAdminActivity = async (activity: any) => {
  try {
    await addDoc(collection(db, 'admin_activity_logs'), {
      ...activity,
      timestamp: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error logging activity:', error);
    throw error;
  }
};

export const getActivityLogs = async (adminEmail?: string, limit_count = 100) => {
  try {
    let q;
    if (adminEmail) {
      q = query(
        collection(db, 'admin_activity_logs'),
        where('adminEmail', '==', adminEmail),
        orderBy('timestamp', 'desc'),
        limit(limit_count)
      );
    } else {
      q = query(
        collection(db, 'admin_activity_logs'),
        orderBy('timestamp', 'desc'),
        limit(limit_count)
      );
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    throw error;
  }
};

// ============== SESSIONS ==============
export const createSession = async (session: any) => {
  try {
    const docRef = await addDoc(collection(db, 'admin_sessions'), {
      ...session,
      loginTime: Timestamp.now(),
      lastActivityTime: Timestamp.now(),
      isActive: true,
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
};

export const getActiveSessions = async () => {
  try {
    const q = query(
      collection(db, 'admin_sessions'),
      where('isActive', '==', true),
      orderBy('loginTime', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching sessions:', error);
    throw error;
  }
};

export const endSession = async (sessionId: string) => {
  try {
    await updateDoc(doc(db, 'admin_sessions', sessionId), {
      isActive: false,
      logoutTime: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error ending session:', error);
    throw error;
  }
};

// ============== LOGIN ATTEMPTS ==============
export const logLoginAttempt = async (attempt: any) => {
  try {
    await addDoc(collection(db, 'admin_login_attempts'), {
      ...attempt,
      timestamp: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error logging login attempt:', error);
    throw error;
  }
};

export const getFailedLoginAttempts = async (ipAddress?: string) => {
  try {
    let q;
    if (ipAddress) {
      q = query(
        collection(db, 'admin_login_attempts'),
        where('ipAddress', '==', ipAddress),
        where('status', '==', 'failed'),
        orderBy('timestamp', 'desc'),
        limit(10)
      );
    } else {
      q = query(
        collection(db, 'admin_login_attempts'),
        where('status', '==', 'failed'),
        orderBy('timestamp', 'desc'),
        limit(50)
      );
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching login attempts:', error);
    throw error;
  }
};

// ============== SYSTEM ALERTS ==============
export const createAlert = async (alert: any) => {
  try {
    await addDoc(collection(db, 'system_alerts'), {
      ...alert,
      createdAt: Timestamp.now(),
      read: false,
    });
  } catch (error) {
    console.error('Error creating alert:', error);
    throw error;
  }
};

export const getUnreadAlerts = async () => {
  try {
    const q = query(
      collection(db, 'system_alerts'),
      where('read', '==', false),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching alerts:', error);
    throw error;
  }
};

export const markAlertAsRead = async (alertId: string) => {
  try {
    await updateDoc(doc(db, 'system_alerts', alertId), {
      read: true,
      readAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error marking alert as read:', error);
    throw error;
  }
};

// ============== BACKUPS ==============
export const createBackupRecord = async (backup: any) => {
  try {
    await addDoc(collection(db, 'system_backups'), {
      ...backup,
      backupTime: Timestamp.now(),
      status: 'completed',
    });
  } catch (error) {
    console.error('Error creating backup record:', error);
    throw error;
  }
};

export const getBackupHistory = async (limit_count = 20) => {
  try {
    const q = query(
      collection(db, 'system_backups'),
      orderBy('backupTime', 'desc'),
      limit(limit_count)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching backups:', error);
    throw error;
  }
};
