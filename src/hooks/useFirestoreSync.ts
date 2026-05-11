import { useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { useAppStore, Project, SavedCalculation, KnowledgeItem, InventoryItem, PunchListItem, DailyReport, Audit, SafetyBriefing, RFI } from '../store/useAppStore';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
}

export function useFirestoreSync() {
  const { user, setProjects, setCalculations, setKnowledge, setInventory, setPunchLists, setDailyReports, setAudits, setSafetyBriefings, setRfis } = useAppStore();

  // Sync Projects
  useEffect(() => {
    if (!user) return;
    const path = 'projects';
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Project[];
      setProjects(projs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
    return () => unsubscribe();
  }, [user, setProjects]);

  // Sync Calculations
  useEffect(() => {
    if (!user) return;
    const path = 'calculations';
    const q = query(collection(db, path), orderBy('date', 'desc'), limit(100));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const calcs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as SavedCalculation[];
      setCalculations(calcs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
    return () => unsubscribe();
  }, [user, setCalculations]);

  // Sync Knowledge
  useEffect(() => {
    if (!user) return;
    const path = 'knowledge';
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as KnowledgeItem[];
      setKnowledge(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
    return () => unsubscribe();
  }, [user, setKnowledge]);

  // Sync Inventory
  useEffect(() => {
    if (!user) return;
    const path = 'inventory';
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as InventoryItem[];
      setInventory(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
    return () => unsubscribe();
  }, [user, setInventory]);

  // Sync Punch Lists
  useEffect(() => {
    if (!user) return;
    const path = 'punch_lists';
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as PunchListItem[];
      setPunchLists(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
    return () => unsubscribe();
  }, [user, setPunchLists]);

  // Sync Daily Reports
  useEffect(() => {
    if (!user) return;
    const path = 'daily_reports';
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as DailyReport[];
      setDailyReports(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
    return () => unsubscribe();
  }, [user, setDailyReports]);

  // Sync Audits
  useEffect(() => {
    if (!user) return;
    const path = 'audits';
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Audit[];
      setAudits(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
    return () => unsubscribe();
  }, [user, setAudits]);

  // Sync Safety Briefings
  useEffect(() => {
    if (!user) return;
    const path = 'safety_briefings';
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as SafetyBriefing[];
      setSafetyBriefings(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
    return () => unsubscribe();
  }, [user, setSafetyBriefings]);

  // Sync RFIs
  useEffect(() => {
    if (!user) return;
    const path = 'rfis';
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as RFI[];
      setRfis(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
    return () => unsubscribe();
  }, [user, setRfis]);
}
