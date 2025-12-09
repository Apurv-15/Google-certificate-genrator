import { db } from "./firebase";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, Timestamp } from "firebase/firestore";
import { uploadToCloudinary } from "./cloudinary";

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
  // Parse the canvas data to extract background image
  const canvasData = JSON.parse(template.canvasData);
  let backgroundImageUrl = "";

  // Check if there's a background image with base64 data
  if (canvasData.backgroundImage && canvasData.backgroundImage.src && canvasData.backgroundImage.src.startsWith("data:")) {
    const originalSize = canvasData.backgroundImage.src.length;
    console.log(`Background image detected: ${(originalSize / 1024).toFixed(2)} KB`);
    console.log("Uploading to Cloudinary...");

    try {
      // Upload to Cloudinary
      backgroundImageUrl = await uploadToCloudinary(canvasData.backgroundImage.src);
      console.log("Uploaded successfully:", backgroundImageUrl);

      // Replace base64 with Cloudinary URL in canvas data
      canvasData.backgroundImage.src = backgroundImageUrl;
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
      throw new Error("Failed to upload background image. Please check your Cloudinary configuration.");
    }
  }

  const newTemplate = {
    name: template.name,
    canvasData: JSON.stringify(canvasData),
    backgroundImage: backgroundImageUrl || undefined,
    namePlaceholder: template.namePlaceholder,
    createdAt: Timestamp.now(),
  };

  // Clean undefined values before saving to Firestore
  const dataToSave = Object.fromEntries(
    Object.entries(newTemplate).filter(([_, v]) => v !== undefined)
  );

  console.log("Saving template to Firestore:", dataToSave);
  const docRef = await addDoc(collection(db, TEMPLATES_COLLECTION), dataToSave);
  console.log("Template saved with ID:", docRef.id);
  return {
    ...template,
    id: docRef.id,
    canvasData: JSON.stringify(canvasData),
    backgroundImage: backgroundImageUrl || undefined,
    createdAt: new Date(),
  };
};

export const updateTemplate = async (id: string, data: Partial<CertificateTemplate>): Promise<void> => {
  const docRef = doc(db, TEMPLATES_COLLECTION, id);
  await updateDoc(docRef, data);
};

export const getTemplates = async (): Promise<CertificateTemplate[]> => {
  console.log("Querying Firestore for templates...");
  const querySnapshot = await getDocs(collection(db, TEMPLATES_COLLECTION));
  console.log(`Found ${querySnapshot.size} templates`);
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

  let cloudinaryUrl = "";
  if (imageData) {
    try {
      // Upload certificate image to Cloudinary
      cloudinaryUrl = await uploadToCloudinary(imageData);

      // Update doc with Cloudinary URL
      await updateDoc(docRef, { imageData: cloudinaryUrl });
      console.log("Certificate image uploaded to Cloudinary:", cloudinaryUrl);
    } catch (error) {
      console.error("Failed to upload certificate image to Cloudinary:", error);
      // Continue even if upload fails - user still has the local image
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
