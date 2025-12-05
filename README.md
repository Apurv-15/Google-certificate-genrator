# CertifyPro - Certificate Generator

CertifyPro is a powerful, web-based certificate generation tool that allows users to design, generate, and verify certificates efficiently. It features a drag-and-drop editor, bulk generation capabilities, and cloud storage for templates and certificates.

## 🚀 Features

- **Certificate Editor**:
  - Drag-and-drop interface using Fabric.js.
  - Add text, shapes, images, and digital signatures.
  - **Import Certificate**: Upload an existing certificate image as a background.
  - **Smart Placeholders**: Use `{name}` in text fields to automatically replace it with recipient names during bulk generation.
  - Customizable fonts, colors, and sizes.

- **Bulk Generation**:
  - Upload names via CSV or Excel files.
  - Generate hundreds of certificates in seconds.
  - Download as ZIP (images) or PDF.
  - Preserves original certificate quality and dimensions.

- **Cloud Storage & Sync**:
  - Powered by **Firebase**.
  - Templates and generated certificates are synced across devices.
  - Secure image storage using Firebase Storage.

- **Verification System**:
  - Each certificate gets a unique ID and QR code.
  - Verify certificate authenticity via the Verify page.

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Vite
- **UI Framework**: Tailwind CSS, shadcn/ui
- **Canvas Library**: Fabric.js
- **Backend/Storage**: Firebase (Firestore & Storage)
- **Utilities**: 
  - `papaparse` (CSV parsing)
  - `xlsx` (Excel parsing)
  - `jszip` (ZIP creation)
  - `jspdf` (PDF generation)
  - `qrcode` (QR code generation)

## 📦 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd certificate-generator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory and add your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

## 📝 Usage Guide

### Creating a Template
1. Go to the **Editor** page.
2. Click **Import Certificate** to upload a base design (optional).
3. Add text fields. To make a field dynamic (for names), type `{name}`.
4. Style the text (font, size, color) as desired.
5. Click **Save Template**.

### Generating Certificates
1. Go to the **Generate** page.
2. Select your saved template.
3. Upload a list of names (CSV/Excel) or enter them manually.
4. Click **Generate**.
5. Download the certificates as a ZIP file or PDF.

### Verifying Certificates
1. Go to the **Verify** page.
2. Enter the Certificate ID found on the generated certificate.
3. View the certificate details and validity status.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
