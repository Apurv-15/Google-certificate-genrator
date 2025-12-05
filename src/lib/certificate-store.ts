import { v4 as uuidv4 } from "uuid";

export interface CertificateTemplate {
  id: string;
  name: string;
  canvasData: string;
  backgroundImage?: string;
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

const TEMPLATES_KEY = "certifypro_templates";
const CERTIFICATES_KEY = "certifypro_certificates";

export const generateCertId = (): string => {
  const prefix = "CERT";
  const year = new Date().getFullYear().toString().slice(-2);
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${year}-${random}`;
};

export const saveTemplate = (template: Omit<CertificateTemplate, "id" | "createdAt">): CertificateTemplate => {
  const templates = getTemplates();
  const newTemplate: CertificateTemplate = {
    ...template,
    id: uuidv4(),
    createdAt: new Date(),
  };
  templates.push(newTemplate);
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
  return newTemplate;
};

export const updateTemplate = (id: string, data: Partial<CertificateTemplate>): void => {
  const templates = getTemplates();
  const index = templates.findIndex((t) => t.id === id);
  if (index !== -1) {
    templates[index] = { ...templates[index], ...data };
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
  }
};

export const getTemplates = (): CertificateTemplate[] => {
  const data = localStorage.getItem(TEMPLATES_KEY);
  return data ? JSON.parse(data) : [];
};

export const getTemplate = (id: string): CertificateTemplate | undefined => {
  return getTemplates().find((t) => t.id === id);
};

export const deleteTemplate = (id: string): void => {
  const templates = getTemplates().filter((t) => t.id !== id);
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
};

export const saveCertificate = (cert: Omit<GeneratedCertificate, "id" | "generatedAt">): GeneratedCertificate => {
  const certificates = getCertificates();
  const newCert: GeneratedCertificate = {
    ...cert,
    id: uuidv4(),
    generatedAt: new Date(),
  };
  certificates.push(newCert);
  localStorage.setItem(CERTIFICATES_KEY, JSON.stringify(certificates));
  return newCert;
};

export const getCertificates = (): GeneratedCertificate[] => {
  const data = localStorage.getItem(CERTIFICATES_KEY);
  return data ? JSON.parse(data) : [];
};

export const verifyCertificate = (certId: string): GeneratedCertificate | undefined => {
  return getCertificates().find((c) => c.certId === certId);
};
