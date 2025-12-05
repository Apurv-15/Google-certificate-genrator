import { db, storage } from "./firebase";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, Timestamp } from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "firebase/storage";

export interface CertificateTemplate {
  id: string;
  name: string;
  canvasData: string;
  backgroundImage?: string;
  namePlaceholder?: string;
  createdAt: Date;
}

export interface GeneratedCertificate {
  id: string;
  certId: string;
  recipientName: string;
  templateId: string;
  templateName: string;
  generatedAt: Date;
  imageData?: string;
}

const TEMPLATES_COLLECTION = "templates";
const CERTIFICATES_COLLECTION = "certificates";

export const generateCertId = (): string => {
  const prefix = "CERT";
  const year = new Date().getFullYear().toString().slice(-2);
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${year}-${random}`;
};

export const saveTemplate = async (template: Omit<CertificateTemplate, "id" | "createdAt">): Promise<CertificateTemplate> => {
  const newTemplate = {
    ...template,
    createdAt: Timestamp.now(),
  };

  // Clean undefined values before saving to Firestore
  const dataToSave = Object.fromEntries(
    Object.entries(newTemplate).filter(([_, v]) => v !== undefined)
  );

  const docRef = await addDoc(collection(db, TEMPLATES_COLLECTION), dataToSave);
  return {
    ...template,
    id: docRef.id,
    createdAt: newTemplate.createdAt.toDate(),
  };
};

export const updateTemplate = async (id: string, data: Partial<CertificateTemplate>): Promise<void> => {
  const docRef = doc(db, TEMPLATES_COLLECTION, id);
  await updateDoc(docRef, data);
};

export const getTemplates = async (): Promise<CertificateTemplate[]> => {
  const querySnapshot = await getDocs(collection(db, TEMPLATES_COLLECTION));
  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      canvasData: data.canvasData,
      backgroundImage: data.backgroundImage,
      namePlaceholder: data.namePlaceholder,
      createdAt: data.createdAt?.toDate() || new Date(),
    } as CertificateTemplate;
  });
};

export const getTemplate = async (id: string): Promise<CertificateTemplate | undefined> => {
  const templates = await getTemplates();
  return templates.find((t) => t.id === id);
};

export const deleteTemplate = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, TEMPLATES_COLLECTION, id));
};

export const saveCertificate = async (cert: Omit<GeneratedCertificate, "id" | "generatedAt">): Promise<GeneratedCertificate> => {
  const { imageData, ...certWithoutImage } = cert;
  const newCert = {
    ...certWithoutImage,
    generatedAt: Timestamp.now(),
  };

  const docRef = await addDoc(collection(db, CERTIFICATES_COLLECTION), newCert);

  let downloadUrl = "";
  if (imageData) {
    try {
      const storageRef = ref(storage, `certificates/${docRef.id}.png`);
      await uploadString(storageRef, imageData, 'data_url');
      downloadUrl = await getDownloadURL(storageRef);

      // Update doc with image URL
      await updateDoc(docRef, { imageData: downloadUrl });
    } catch (error) {
      console.error("Failed to upload certificate image:", error);
    }
  }

  return {
    ...newCert,
    id: docRef.id,
    generatedAt: newCert.generatedAt.toDate(),
    imageData: imageData, // Return original base64 for immediate UI use
  } as GeneratedCertificate;
};

export const getCertificates = async (): Promise<GeneratedCertificate[]> => {
  const querySnapshot = await getDocs(collection(db, CERTIFICATES_COLLECTION));
  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      certId: data.certId,
      recipientName: data.recipientName,
      templateId: data.templateId,
      templateName: data.templateName,
      generatedAt: data.generatedAt?.toDate() || new Date(),
      imageData: data.imageData,
    } as GeneratedCertificate;
  });
};

export const verifyCertificate = async (certId: string): Promise<GeneratedCertificate | undefined> => {
  const q = query(collection(db, CERTIFICATES_COLLECTION), where("certId", "==", certId));
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) return undefined;
  const doc = querySnapshot.docs[0];
  const data = doc.data();
  return {
    id: doc.id,
    certId: data.certId,
    recipientName: data.recipientName,
    templateId: data.templateId,
    templateName: data.templateName,
    generatedAt: data.generatedAt?.toDate() || new Date(),
    imageData: data.imageData,
  } as GeneratedCertificate;
};
