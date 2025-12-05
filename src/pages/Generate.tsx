import { useState, useRef, useEffect } from "react";
import { Canvas as FabricCanvas, IText, FabricImage } from "fabric";
import { motion } from "framer-motion";
import { Upload, FileSpreadsheet, User, Download, Loader2, FileText, Trash2 } from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import JSZip from "jszip";
import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Layout } from "@/components/layout/Layout";
import {
  getTemplates,
  CertificateTemplate,
  saveCertificate,
  generateCertId,
} from "@/lib/certificate-store";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface GeneratedCert {
  name: string;
  certId: string;
  imageData: string;
}

const Generate = () => {
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<CertificateTemplate | null>(null);
  const [names, setNames] = useState<string[]>([]);
  const [singleName, setSingleName] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCerts, setGeneratedCerts] = useState<GeneratedCert[]>([]);
  const [progress, setProgress] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    getTemplates().then(setTemplates);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const extension = file.name.split(".").pop()?.toLowerCase();

    if (extension === "csv") {
      Papa.parse(file, {
        complete: (results) => {
          const nameList = results.data
            .flat()
            .filter((name): name is string => typeof name === "string" && name.trim() !== "");
          setNames(nameList);
          toast.success(`Loaded ${nameList.length} names from CSV`);
        },
        error: () => toast.error("Failed to parse CSV file"),
      });
    } else if (extension === "xlsx" || extension === "xls") {
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json<string[]>(firstSheet, { header: 1 });
        const nameList = jsonData.flat().filter((name) => typeof name === "string" && name.trim() !== "");
        setNames(nameList);
        toast.success(`Loaded ${nameList.length} names from Excel`);
      };
      reader.readAsBinaryString(file);
    } else {
      toast.error("Please upload a CSV or Excel file");
    }
  };

  const handleManualNames = (text: string) => {
    const nameList = text
      .split("\n")
      .map((n) => n.trim())
      .filter((n) => n !== "");
    setNames(nameList);
  };

  const addSingleName = () => {
    if (singleName.trim()) {
      setNames((prev) => [...prev, singleName.trim()]);
      setSingleName("");
    }
  };

  const removeName = (index: number) => {
    setNames((prev) => prev.filter((_, i) => i !== index));
  };

  const generateCertificates = async () => {
    if (!selectedTemplate || names.length === 0) {
      toast.error("Please select a template and add names");
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setGeneratedCerts([]);

    // Parse template to get canvas dimensions
    const templateData = JSON.parse(selectedTemplate.canvasData);
    const canvasWidth = templateData.width || 800;
    const canvasHeight = templateData.height || 566;

    const hiddenCanvas = document.createElement("canvas");
    hiddenCanvas.width = canvasWidth;
    hiddenCanvas.height = canvasHeight;

    const fabricCanvas = new FabricCanvas(hiddenCanvas, {
      width: canvasWidth,
      height: canvasHeight,
    });

    const generated: GeneratedCert[] = [];

    for (let i = 0; i < names.length; i++) {
      const name = names[i];
      const certId = generateCertId();

      await fabricCanvas.loadFromJSON(JSON.parse(selectedTemplate.canvasData));

      // Find and update name placeholder
      const objects = fabricCanvas.getObjects();
      let nameUpdated = false;

      // Use template's name placeholder if specified, otherwise look for common patterns
      const placeholderText = selectedTemplate.namePlaceholder || "{name}";

      for (const obj of objects) {
        if (obj.type === "i-text" || obj.type === "text") {
          const textObj = obj as IText;
          const text = textObj.text || "";

          // Check if this text object contains the placeholder
          if (text.includes(placeholderText)) {
            // Replace the placeholder with the actual name, preserving all other properties
            textObj.set("text", text.replace(placeholderText, name));
            nameUpdated = true;
            break;
          }
        }
      }

      // If no placeholder found, show a warning but don't add name
      if (!nameUpdated) {
        console.warn(`No placeholder "${placeholderText}" found in template for ${name}`);
      }

      // Add cert ID
      const certIdText = new IText(`Cert ID: ${certId}`, {
        left: 700,
        top: 530,
        fontSize: 12,
        fontFamily: "Roboto Mono",
        fill: "#666666",
        originX: "right",
      });
      fabricCanvas.add(certIdText);

      // Generate QR code
      try {
        const qrDataUrl = await QRCode.toDataURL(certId, { width: 60, margin: 1 });
        const qrImg = await FabricImage.fromURL(qrDataUrl);
        qrImg.set({
          left: 720,
          top: 480,
          originX: "center",
          originY: "center",
        });
        fabricCanvas.add(qrImg);
      } catch (err) {
        console.log("QR generation skipped");
      }

      fabricCanvas.renderAll();

      const imageData = fabricCanvas.toDataURL({ format: "png", multiplier: 2 });

      // Save to store
      await saveCertificate({
        certId,
        recipientName: name,
        templateId: selectedTemplate.id,
        templateName: selectedTemplate.name,
        imageData,
      });

      generated.push({ name, certId, imageData });
      setProgress(Math.round(((i + 1) / names.length) * 100));
    }

    fabricCanvas.dispose();
    setGeneratedCerts(generated);
    setIsGenerating(false);
    toast.success(`Generated ${generated.length} certificates!`);
  };

  const downloadZip = async () => {
    if (generatedCerts.length === 0) return;

    const zip = new JSZip();

    generatedCerts.forEach((cert) => {
      const base64 = cert.imageData.split(",")[1];
      zip.file(`${cert.name.replace(/\s+/g, "_")}_${cert.certId}.png`, base64, { base64: true });
    });

    const blob = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "certificates.zip";
    link.click();
    toast.success("Downloaded certificates as ZIP");
  };

  const downloadPDF = () => {
    if (generatedCerts.length === 0) return;

    const pdf = new jsPDF("landscape", "mm", "a4");
    const pageWidth = 297;
    const pageHeight = 210;
    const imgWidth = 280;
    const imgHeight = 198;

    generatedCerts.forEach((cert, index) => {
      if (index > 0) pdf.addPage();
      const x = (pageWidth - imgWidth) / 2;
      const y = (pageHeight - imgHeight) / 2;
      pdf.addImage(cert.imageData, "PNG", x, y, imgWidth, imgHeight);
    });

    pdf.save("certificates.pdf");
    toast.success("Downloaded certificates as PDF");
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">Generate Certificates</h1>
          <p className="text-muted-foreground">Bulk generate certificates from your templates</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Template Selection */}
            <Card className="glass border-0">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Select Template
                </CardTitle>
              </CardHeader>
              <CardContent>
                {templates.length > 0 ? (
                  <Select
                    onValueChange={(id) => {
                      const t = templates.find((t) => t.id === id);
                      setSelectedTemplate(t || null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a template..." />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No templates found. Create one in the Editor first.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Name Input */}
            <Card className="glass border-0">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Add Names
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="upload">
                  <TabsList className="grid w-full grid-cols-3 mb-4">
                    <TabsTrigger value="upload">Upload File</TabsTrigger>
                    <TabsTrigger value="paste">Paste List</TabsTrigger>
                    <TabsTrigger value="single">Single Name</TabsTrigger>
                  </TabsList>

                  <TabsContent value="upload" className="space-y-4">
                    <label className="block">
                      <div className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors">
                        <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                        <p className="text-sm text-muted-foreground">
                          Drop CSV or Excel file here, or click to browse
                        </p>
                      </div>
                      <input
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </TabsContent>

                  <TabsContent value="paste" className="space-y-4">
                    <div>
                      <Label>Paste names (one per line)</Label>
                      <Textarea
                        placeholder="John Doe&#10;Jane Smith&#10;..."
                        rows={6}
                        onChange={(e) => handleManualNames(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="single" className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter name..."
                        value={singleName}
                        onChange={(e) => setSingleName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addSingleName()}
                      />
                      <Button onClick={addSingleName}>Add</Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Names List */}
            {names.length > 0 && (
              <Card className="glass border-0">
                <CardHeader>
                  <CardTitle className="text-lg">
                    Names ({names.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {names.map((name, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between bg-muted/30 rounded-lg px-3 py-2"
                      >
                        <span className="text-sm">{name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeName(i)}
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setNames([])}
                    className="mt-3 w-full"
                  >
                    Clear All
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Generate Button */}
            <Button
              onClick={generateCertificates}
              disabled={!selectedTemplate || names.length === 0 || isGenerating}
              className="w-full h-12 text-lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating... {progress}%
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-5 h-5 mr-2" />
                  Generate {names.length} Certificate{names.length !== 1 ? "s" : ""}
                </>
              )}
            </Button>
          </motion.div>

          {/* Output Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card className="glass border-0 h-full">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Download className="w-5 h-5 text-primary" />
                  Generated Certificates
                </CardTitle>
              </CardHeader>
              <CardContent>
                {generatedCerts.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <Button onClick={downloadZip} className="flex-1 gap-2">
                        <Download className="w-4 h-4" />
                        Download ZIP
                      </Button>
                      <Button onClick={downloadPDF} variant="outline" className="flex-1 gap-2">
                        <Download className="w-4 h-4" />
                        Download PDF
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                      {generatedCerts.map((cert, i) => (
                        <div key={i} className="relative group">
                          <img
                            src={cert.imageData}
                            alt={cert.name}
                            className="w-full rounded-lg border border-border"
                          />
                          <div className="absolute inset-0 bg-foreground/80 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col items-center justify-center text-primary-foreground p-2">
                            <p className="text-sm font-medium text-center truncate w-full">
                              {cert.name}
                            </p>
                            <p className="text-xs opacity-80">{cert.certId}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16 text-muted-foreground">
                    <FileSpreadsheet className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Generated certificates will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default Generate;
