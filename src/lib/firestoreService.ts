
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  Timestamp,
  addDoc,
  DocumentReference
} from 'firebase/firestore';
import { db } from './firebase';

// Types
export interface Owner {
  id?: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
  userId: string;
  createdAt: Timestamp;
}

export interface Pet {
  id?: string;
  name: string;
  species: string;
  breed: string;
  gender: string;
  age: string;
  weight: string;
  dateOfBirth?: Timestamp;
  microchipId: string;
  insuranceProvider: string;
  policyNumber: string;
  notes: string;
  ownerId: string;
  userId: string;
  createdAt: Timestamp;
}

export interface MedicalRecord {
  id?: string;
  type: string;
  date: Timestamp;
  description: string;
  diagnosis: string;
  treatment: string;
  medications: string;
  notes: string;
  status: string;
  petId: string;
  userId: string;
  createdAt: Timestamp;
}

// Owners
export const createOwner = async (ownerData: Omit<Owner, 'id' | 'createdAt'>) => {
  try {
    const ownerRef = collection(db, 'owners');
    const newOwner = {
      ...ownerData,
      createdAt: Timestamp.now()
    };
    
    const docRef = await addDoc(ownerRef, newOwner);
    return { id: docRef.id, ...newOwner };
  } catch (error) {
    console.error('Error creating owner:', error);
    throw error;
  }
};

export const getOwners = async (userId: string) => {
  try {
    const ownersRef = collection(db, 'owners');
    const q = query(
      ownersRef, 
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Owner));
  } catch (error) {
    console.error('Error getting owners:', error);
    throw error;
  }
};

export const getOwnerById = async (ownerId: string) => {
  try {
    const ownerRef = doc(db, 'owners', ownerId);
    const ownerDoc = await getDoc(ownerRef);
    
    if (ownerDoc.exists()) {
      return { id: ownerDoc.id, ...ownerDoc.data() } as Owner;
    } else {
      throw new Error('Owner not found');
    }
  } catch (error) {
    console.error('Error getting owner:', error);
    throw error;
  }
};

export const updateOwner = async (ownerId: string, ownerData: Partial<Owner>) => {
  try {
    const ownerRef = doc(db, 'owners', ownerId);
    await updateDoc(ownerRef, ownerData);
    return { id: ownerId, ...ownerData };
  } catch (error) {
    console.error('Error updating owner:', error);
    throw error;
  }
};

export const deleteOwner = async (ownerId: string) => {
  try {
    const ownerRef = doc(db, 'owners', ownerId);
    await deleteDoc(ownerRef);
    return true;
  } catch (error) {
    console.error('Error deleting owner:', error);
    throw error;
  }
};

// Pets
export const createPet = async (petData: Omit<Pet, 'id' | 'createdAt'>) => {
  try {
    const petsRef = collection(db, 'pets');
    const newPet = {
      ...petData,
      createdAt: Timestamp.now()
    };
    
    const docRef = await addDoc(petsRef, newPet);
    return { id: docRef.id, ...newPet };
  } catch (error) {
    console.error('Error creating pet:', error);
    throw error;
  }
};

export const getPets = async (userId: string, ownerId?: string) => {
  try {
    const petsRef = collection(db, 'pets');
    let q;
    
    if (ownerId) {
      q = query(
        petsRef, 
        where('userId', '==', userId),
        where('ownerId', '==', ownerId),
        orderBy('createdAt', 'desc')
      );
    } else {
      q = query(
        petsRef, 
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Pet));
  } catch (error) {
    console.error('Error getting pets:', error);
    throw error;
  }
};

export const getPetById = async (petId: string) => {
  try {
    const petRef = doc(db, 'pets', petId);
    const petDoc = await getDoc(petRef);
    
    if (petDoc.exists()) {
      return { id: petDoc.id, ...petDoc.data() } as Pet;
    } else {
      throw new Error('Pet not found');
    }
  } catch (error) {
    console.error('Error getting pet:', error);
    throw error;
  }
};

export const updatePet = async (petId: string, petData: Partial<Pet>) => {
  try {
    const petRef = doc(db, 'pets', petId);
    await updateDoc(petRef, petData);
    return { id: petId, ...petData };
  } catch (error) {
    console.error('Error updating pet:', error);
    throw error;
  }
};

export const deletePet = async (petId: string) => {
  try {
    const petRef = doc(db, 'pets', petId);
    await deleteDoc(petRef);
    return true;
  } catch (error) {
    console.error('Error deleting pet:', error);
    throw error;
  }
};

// Medical Records
export const createMedicalRecord = async (recordData: Omit<MedicalRecord, 'id' | 'createdAt'>) => {
  try {
    const recordsRef = collection(db, 'medicalRecords');
    const newRecord = {
      ...recordData,
      createdAt: Timestamp.now()
    };
    
    const docRef = await addDoc(recordsRef, newRecord);
    return { id: docRef.id, ...newRecord };
  } catch (error) {
    console.error('Error creating medical record:', error);
    throw error;
  }
};

export const getMedicalRecords = async (userId: string, petId?: string) => {
  try {
    const recordsRef = collection(db, 'medicalRecords');
    let q;
    
    if (petId) {
      q = query(
        recordsRef, 
        where('userId', '==', userId),
        where('petId', '==', petId),
        orderBy('date', 'desc')
      );
    } else {
      q = query(
        recordsRef, 
        where('userId', '==', userId),
        orderBy('date', 'desc')
      );
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as MedicalRecord));
  } catch (error) {
    console.error('Error getting medical records:', error);
    throw error;
  }
};

export const getMedicalRecordById = async (recordId: string) => {
  try {
    const recordRef = doc(db, 'medicalRecords', recordId);
    const recordDoc = await getDoc(recordRef);
    
    if (recordDoc.exists()) {
      return { id: recordDoc.id, ...recordDoc.data() } as MedicalRecord;
    } else {
      throw new Error('Medical record not found');
    }
  } catch (error) {
    console.error('Error getting medical record:', error);
    throw error;
  }
};

export const updateMedicalRecord = async (recordId: string, recordData: Partial<MedicalRecord>) => {
  try {
    const recordRef = doc(db, 'medicalRecords', recordId);
    await updateDoc(recordRef, recordData);
    return { id: recordId, ...recordData };
  } catch (error) {
    console.error('Error updating medical record:', error);
    throw error;
  }
};

export const deleteMedicalRecord = async (recordId: string) => {
  try {
    const recordRef = doc(db, 'medicalRecords', recordId);
    await deleteDoc(recordRef);
    return true;
  } catch (error) {
    console.error('Error deleting medical record:', error);
    throw error;
  }
};
