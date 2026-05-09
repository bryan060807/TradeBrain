import { useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { useAppStore, Project, SavedCalculation, KnowledgeItem } from '../store/useAppStore';

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
  const { user, setProjects, setCalculations, setKnowledge } = useAppStore();

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
}
