import { useEffect, useRef, useState, useCallback } from "react";
import { Canvas as FabricCanvas, IText, Rect, Circle, FabricImage, PencilBrush } from "fabric";
import { createWorker } from "tesseract.js";
import { motion } from "framer-motion";
import {
  Type,
  Square,
  CircleIcon,
  Image,
  Trash2,
  Download,
  Save,
  Upload,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Layers,
  MoveUp,
  MoveDown,
  PenTool,
  ImagePlus,
  Move,
  ScanText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Layout } from "@/components/layout/Layout";
import { saveTemplate, getTemplates, CertificateTemplate } from "@/lib/certificate-store";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

const FONTS = [
  "Arial",
  "Times New Roman",
  "Georgia",
  "Courier New",
  "Verdana",
  "Roboto",
  "Libre Caslon Text",
];

const Editor = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  const uploadExtractInputRef = useRef<HTMLInputElement>(null);
  const [canvas, setCanvas] = useState<FabricCanvas | null>(null);
  const [signatureCanvas, setSignatureCanvas] = useState<FabricCanvas | null>(null);
  const [selectedObject, setSelectedObject] = useState<any>(null);
  const [zoom, setZoom] = useState(1);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [templateName, setTemplateName] = useState("");
  const [textColor, setTextColor] = useState("#000000");
  const [fontSize, setFontSize] = useState(24);
  const [selectedFont, setSelectedFont] = useState("Arial");
  const [signatureDialogOpen, setSignatureDialogOpen] = useState(false);
  const [objectWidth, setObjectWidth] = useState(100);
  const [objectHeight, setObjectHeight] = useState(100);

  useEffect(() => {
    if (!canvasRef.current) return;

    const fabricCanvas = new FabricCanvas(canvasRef.current, {
      width: 800,
      height: 566,
      backgroundColor: "#f5f5f0",
      selection: true,
    });

    fabricCanvas.on("selection:created", (e) => {
      setSelectedObject(e.selected?.[0]);
      updateObjectDimensions(e.selected?.[0]);
    });
    fabricCanvas.on("selection:updated", (e) => {
      setSelectedObject(e.selected?.[0]);
      updateObjectDimensions(e.selected?.[0]);
    });
    fabricCanvas.on("selection:cleared", () => setSelectedObject(null));
    fabricCanvas.on("object:modified", (e) => {
      saveToHistory(fabricCanvas);
      updateObjectDimensions(e.target);
    });
    fabricCanvas.on("object:scaling", (e) => {
      updateObjectDimensions(e.target);
    });

    setCanvas(fabricCanvas);

    const fetchTemplates = async () => {
      try {
        console.log("Fetching templates...");
        const temps = await getTemplates();
        console.log("Templates fetched:", temps);
        setTemplates(temps);
      } catch (error) {
        console.error("Error fetching templates:", error);
        toast.error("Failed to load templates");
      }
    };

    fetchTemplates();
    saveToHistory(fabricCanvas);

    return () => {
      fabricCanvas.dispose();
    };
  }, []);

  // Initialize signature canvas when dialog opens
  useEffect(() => {
    if (signatureDialogOpen && signatureCanvasRef.current && !signatureCanvas) {
      const sigCanvas = new FabricCanvas(signatureCanvasRef.current, {
        width: 400,
        height: 200,
        backgroundColor: "#ffffff",
        isDrawingMode: true,
      });
      sigCanvas.freeDrawingBrush = new PencilBrush(sigCanvas);
      sigCanvas.freeDrawingBrush.color = "#000000";
      sigCanvas.freeDrawingBrush.width = 2;
      setSignatureCanvas(sigCanvas);
    }
  }, [signatureDialogOpen, signatureCanvas]);

  const updateObjectDimensions = (obj: any) => {
    if (obj) {
      const scaledWidth = Math.round((obj.width || 100) * (obj.scaleX || 1));
      const scaledHeight = Math.round((obj.height || 100) * (obj.scaleY || 1));
      setObjectWidth(scaledWidth);
      setObjectHeight(scaledHeight);
    }
  };

  const saveToHistory = useCallback((c: FabricCanvas) => {
    const json = JSON.stringify(c.toJSON());
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(json);
      return newHistory.slice(-50);
    });
    setHistoryIndex((prev) => Math.min(prev + 1, 49));
  }, [historyIndex]);

  const undo = () => {
    if (historyIndex > 0 && canvas) {
      const newIndex = historyIndex - 1;
      canvas.loadFromJSON(JSON.parse(history[newIndex])).then(() => {
        canvas.renderAll();
        setHistoryIndex(newIndex);
      });
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1 && canvas) {
      const newIndex = historyIndex + 1;
      canvas.loadFromJSON(JSON.parse(history[newIndex])).then(() => {
        canvas.renderAll();
        setHistoryIndex(newIndex);
      });
    }
  };

  const addText = () => {
    if (!canvas) return;
    const text = new IText("Double click to edit", {
      left: 100,
      top: 100,
      fontSize: fontSize,
      fill: textColor,
      fontFamily: selectedFont,
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    saveToHistory(canvas);
  };

  const addRect = () => {
    if (!canvas) return;
    const rect = new Rect({
      left: 100,
      top: 100,
      width: 150,
      height: 100,
      fill: "transparent",
      stroke: "#333",
      strokeWidth: 2,
      rx: 8,
      ry: 8,
    });
    canvas.add(rect);
    canvas.setActiveObject(rect);
    saveToHistory(canvas);
  };

  const addCircle = () => {
    if (!canvas) return;
    const circle = new Circle({
      left: 100,
      top: 100,
      radius: 50,
      fill: "transparent",
      stroke: "#333",
      strokeWidth: 2,
    });
    canvas.add(circle);
    canvas.setActiveObject(circle);
    saveToHistory(canvas);
  };

  const uploadBackground = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !canvas) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imgUrl = event.target?.result as string;
      FabricImage.fromURL(imgUrl).then((img) => {
        const scale = Math.min(800 / img.width!, 566 / img.height!);
        img.scale(scale);
        img.set({
          left: 0,
          top: 0,
          selectable: false,
          evented: false,
        });
        canvas.backgroundImage = img;
        canvas.renderAll();
        saveToHistory(canvas);
      });
    };
    reader.readAsDataURL(file);
  };

  const addImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !canvas) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imgUrl = event.target?.result as string;
      FabricImage.fromURL(imgUrl).then((img) => {
        // Scale image to fit reasonably on canvas
        const maxSize = 200;
        const scale = Math.min(maxSize / img.width!, maxSize / img.height!, 1);
        img.scale(scale);
        img.set({
          left: 100,
          top: 100,
        });
        canvas.add(img);
        canvas.setActiveObject(img);
        saveToHistory(canvas);
        toast.success("Image added to canvas");
      });
    };
    reader.readAsDataURL(file);
  };

  const clearSignatureCanvas = () => {
    if (signatureCanvas) {
      signatureCanvas.clear();
      signatureCanvas.backgroundColor = "#ffffff";
      signatureCanvas.renderAll();
    }
  };

  const addSignatureToCanvas = () => {
    if (!signatureCanvas || !canvas) return;

    const dataURL = signatureCanvas.toDataURL({ format: "png", multiplier: 1 });
    FabricImage.fromURL(dataURL).then((img) => {
      // Scale signature to reasonable size
      const maxWidth = 150;
      const scale = Math.min(maxWidth / img.width!, 1);
      img.scale(scale);
      img.set({
        left: 100,
        top: 400,
      });
      canvas.add(img);
      canvas.setActiveObject(img);
      saveToHistory(canvas);
      toast.success("Signature added to certificate");
      setSignatureDialogOpen(false);
      // Clear and reset signature canvas
      clearSignatureCanvas();
    });
  };

  const uploadSignature = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !canvas) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imgUrl = event.target?.result as string;
      FabricImage.fromURL(imgUrl).then((img) => {
        const maxWidth = 150;
        const scale = Math.min(maxWidth / img.width!, 1);
        img.scale(scale);
        img.set({
          left: 100,
          top: 400,
        });
        canvas.add(img);
        canvas.setActiveObject(img);
        saveToHistory(canvas);
        toast.success("Signature image added");
        setSignatureDialogOpen(false);
      });
    };
    reader.readAsDataURL(file);
  };

  const handleUploadAndExtract = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !canvas) return;

    const toastId = toast.loading("Loading certificate...");

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const imgUrl = event.target?.result as string;

        try {
          // Load the image
          const img = await FabricImage.fromURL(imgUrl);

          // Get original image dimensions
          const originalWidth = img.width || 800;
          const originalHeight = img.height || 600;

          // Calculate scale to fit viewport (max 1200x800 px)
          const maxViewportWidth = 1200;
          const maxViewportHeight = 800;
          const scale = Math.min(
            maxViewportWidth / originalWidth,
            maxViewportHeight / originalHeight,
            1 // Don't scale up, only scale down
          );

          // Calculate display dimensions
          const displayWidth = Math.round(originalWidth * scale);
          const displayHeight = Math.round(originalHeight * scale);

          // Resize canvas to fit viewport
          canvas.setDimensions({
            width: displayWidth,
            height: displayHeight
          });

          // Scale the image to fit
          img.scale(scale);
          img.set({
            left: 0,
            top: 0,
            selectable: false,
            evented: false,
          });

          canvas.backgroundImage = img;
          canvas.renderAll();
          saveToHistory(canvas);
          toast.dismiss(toastId);

          const scaleInfo = scale < 1
            ? ` (scaled to ${Math.round(scale * 100)}% for editing)`
            : '';
          toast.success(`Certificate loaded! Original size: ${originalWidth}x${originalHeight}px${scaleInfo}`);

        } catch (error) {
          console.error("Load Error:", error);
          toast.dismiss(toastId);
          toast.error("Failed to load certificate image.");
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      toast.dismiss(toastId);
      toast.error("Failed to process image");
    }
  };

  const deleteSelected = () => {
    if (!canvas || !selectedObject) return;
    canvas.remove(selectedObject);
    setSelectedObject(null);
    saveToHistory(canvas);
  };

  const handleZoom = (delta: number) => {
    if (!canvas) return;
    const newZoom = Math.max(0.5, Math.min(2, zoom + delta));
    canvas.setZoom(newZoom);
    setZoom(newZoom);
  };

  const updateTextProperty = (property: string, value: any) => {
    if (!selectedObject || !canvas) return;
    selectedObject.set(property, value);
    canvas.renderAll();
    saveToHistory(canvas);
  };

  const updateObjectSize = (width: number, height: number) => {
    if (!selectedObject || !canvas) return;

    const currentWidth = selectedObject.width || 100;
    const currentHeight = selectedObject.height || 100;

    selectedObject.set({
      scaleX: width / currentWidth,
      scaleY: height / currentHeight,
    });

    canvas.renderAll();
    saveToHistory(canvas);
  };

  const bringForward = () => {
    if (!canvas || !selectedObject) return;
    canvas.bringObjectForward(selectedObject);
    canvas.renderAll();
  };

  const sendBackward = () => {
    if (!canvas || !selectedObject) return;
    canvas.sendObjectBackwards(selectedObject);
    canvas.renderAll();
  };

  const exportPNG = () => {
    if (!canvas) return;
    const dataURL = canvas.toDataURL({ format: "png", multiplier: 2 });
    const link = document.createElement("a");
    link.download = "certificate.png";
    link.href = dataURL;
    link.click();
    toast.success("Certificate exported as PNG");
  };

  const saveAsTemplate = async () => {
    if (!canvas || !templateName.trim()) {
      toast.error("Please enter a template name");
      return;
    }

    const toastId = toast.loading("Saving template...");

    try {
      console.log("Attempting to save template:", templateName);
      console.log("Canvas dimensions:", canvas.getWidth(), "x", canvas.getHeight());

      const canvasJSON = canvas.toJSON();
      // Explicitly ensure dimensions are included
      canvasJSON.width = canvas.getWidth();
      canvasJSON.height = canvas.getHeight();

      const template = await saveTemplate({
        name: templateName,
        canvasData: JSON.stringify(canvasJSON),
      });
      console.log("Template saved successfully:", template);

      const updatedTemplates = await getTemplates();
      setTemplates(updatedTemplates);
      setTemplateName("");
      toast.dismiss(toastId);
      toast.success(`Template "${template.name}" saved`);
    } catch (error: any) {
      console.error("Error saving template:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      toast.dismiss(toastId);

      if (error.code === 'permission-denied') {
        toast.error("Firebase permission denied. Please check your Firestore rules.");
      } else {
        toast.error(`Failed to save template: ${error.message || 'Unknown error'}`);
      }
    }
  };

  const loadTemplate = (template: CertificateTemplate) => {
    if (!canvas) return;
    try {
      const json = JSON.parse(template.canvasData);

      // Ensure cross-origin loading for background images
      if (json.backgroundImage && typeof json.backgroundImage === 'object') {
        json.backgroundImage.crossOrigin = 'anonymous';
      }

      canvas.loadFromJSON(json).then(() => {
        canvas.renderAll();
        toast.success(`Loaded "${template.name}"`);
      }).catch((err) => {
        console.error("Error loading template JSON:", err);
        toast.error("Failed to render template");
      });
    } catch (error) {
      console.error("Error parsing template data:", error);
      toast.error("Failed to load template data");
    }
  };

  const isTextObject = selectedObject?.type === "i-text" || selectedObject?.type === "text";
  const isImageObject = selectedObject?.type === "image";

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">Certificate Editor</h1>
          <p className="text-muted-foreground">Design your certificate with full control</p>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr_300px] gap-6">
          {/* Canvas Area */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl p-6"
          >
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-2 mb-4 p-3 bg-muted/30 rounded-xl">
              <Button variant="outline" size="sm" onClick={addText} className="gap-2">
                <Type className="w-4 h-4" /> Text
              </Button>
              <Button variant="outline" size="sm" onClick={addRect} className="gap-2">
                <Square className="w-4 h-4" /> Rectangle
              </Button>
              <Button variant="outline" size="sm" onClick={addCircle} className="gap-2">
                <CircleIcon className="w-4 h-4" /> Circle
              </Button>

              <div className="h-6 w-px bg-border mx-2" />

              {/* Add Image */}
              <label className="cursor-pointer">
                <Button variant="outline" size="sm" className="gap-2 pointer-events-none">
                  <ImagePlus className="w-4 h-4" /> Image
                </Button>
                <input type="file" accept="image/*" onChange={addImage} className="hidden" />
              </label>

              {/* Digital Signature */}
              <Dialog open={signatureDialogOpen} onOpenChange={setSignatureDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <PenTool className="w-4 h-4" /> Signature
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add Digital Signature</DialogTitle>
                    <DialogDescription>
                      Draw your signature or upload an image to add to the certificate.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="border border-border rounded-lg overflow-hidden">
                      <canvas ref={signatureCanvasRef} className="w-full" />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={clearSignatureCanvas}>
                        Clear
                      </Button>
                      <label className="cursor-pointer">
                        <Button variant="outline" size="sm" className="pointer-events-none gap-2">
                          <Upload className="w-4 h-4" /> Upload
                        </Button>
                        <input type="file" accept="image/*" onChange={uploadSignature} className="hidden" />
                      </label>
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={addSignatureToCanvas}>Add Signature</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <div className="h-6 w-px bg-border mx-2" />

              <label className="cursor-pointer">
                <Button variant="outline" size="sm" className="gap-2 pointer-events-none">
                  <Image className="w-4 h-4" /> Background
                </Button>
                <input type="file" accept="image/*" onChange={uploadBackground} className="hidden" />
              </label>

              <div className="h-6 w-px bg-border mx-2" />

              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => uploadExtractInputRef.current?.click()}
              >
                <ScanText className="w-4 h-4" /> Import Certificate
              </Button>
              <input
                ref={uploadExtractInputRef}
                type="file"
                accept="image/*"
                onChange={handleUploadAndExtract}
                className="hidden"
              />

              <div className="h-6 w-px bg-border mx-2" />

              <Button variant="outline" size="sm" onClick={undo} disabled={historyIndex <= 0}>
                <Undo className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={redo} disabled={historyIndex >= history.length - 1}>
                <Redo className="w-4 h-4" />
              </Button>

              <div className="h-6 w-px bg-border mx-2" />

              <Button variant="outline" size="sm" onClick={() => handleZoom(-0.1)}>
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm text-muted-foreground w-12 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <Button variant="outline" size="sm" onClick={() => handleZoom(0.1)}>
                <ZoomIn className="w-4 h-4" />
              </Button>

              <div className="h-6 w-px bg-border mx-2" />

              <Button
                variant="outline"
                size="sm"
                onClick={deleteSelected}
                disabled={!selectedObject}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Canvas */}
            <div className="overflow-auto bg-muted/20 rounded-xl p-4 flex items-center justify-center max-h-[900px]">
              <canvas ref={canvasRef} className="border border-border rounded-lg shadow-lg" />
            </div>

            {/* Export Actions */}
            <div className="flex flex-wrap items-center gap-3 mt-4">
              <Button onClick={exportPNG} className="gap-2">
                <Download className="w-4 h-4" /> Export PNG
              </Button>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Save className="w-4 h-4" /> Save Template
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Save as Template</DialogTitle>
                    <DialogDescription>
                      Save your certificate design as a template for bulk generation.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div>
                      <Label>Template Name</Label>
                      <Input
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                        placeholder="My Certificate Template"
                      />
                    </div>
                    <Button onClick={saveAsTemplate} className="w-full">
                      Save Template
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Select onValueChange={(id) => {
                const t = templates.find((t) => t.id === id);
                if (t) loadTemplate(t);
              }} disabled={templates.length === 0}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder={templates.length > 0 ? "Load template..." : "No saved templates"} />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </motion.div>

          {/* Properties Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass rounded-2xl p-6 h-fit"
          >
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4" /> Properties
            </h3>

            {selectedObject ? (
              <div className="space-y-6">
                {/* Size Controls - for all objects */}
                <div>
                  <Label className="text-sm flex items-center gap-2">
                    <Move className="w-3 h-3" /> Size
                  </Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">Width</Label>
                      <Input
                        type="number"
                        value={objectWidth}
                        onChange={(e) => {
                          const newWidth = parseInt(e.target.value) || 100;
                          setObjectWidth(newWidth);
                          updateObjectSize(newWidth, objectHeight);
                        }}
                        className="h-8 mt-1"
                        min={10}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Height</Label>
                      <Input
                        type="number"
                        value={objectHeight}
                        onChange={(e) => {
                          const newHeight = parseInt(e.target.value) || 100;
                          setObjectHeight(newHeight);
                          updateObjectSize(objectWidth, newHeight);
                        }}
                        className="h-8 mt-1"
                        min={10}
                      />
                    </div>
                  </div>
                </div>

                {isTextObject && (
                  <>
                    <div>
                      <Label className="text-sm">Font Family</Label>
                      <Select
                        value={selectedObject.fontFamily}
                        onValueChange={(v) => updateTextProperty("fontFamily", v)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FONTS.map((font) => (
                            <SelectItem key={font} value={font}>
                              {font}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm">Font Size: {selectedObject.fontSize}px</Label>
                      <Slider
                        value={[selectedObject.fontSize]}
                        onValueChange={([v]) => updateTextProperty("fontSize", v)}
                        min={8}
                        max={120}
                        step={1}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label className="text-sm">Text Color</Label>
                      <Input
                        type="color"
                        value={selectedObject.fill || "#000000"}
                        onChange={(e) => updateTextProperty("fill", e.target.value)}
                        className="h-10 mt-1"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant={selectedObject.fontWeight === "bold" ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateTextProperty("fontWeight", selectedObject.fontWeight === "bold" ? "normal" : "bold")}
                      >
                        <Bold className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={selectedObject.fontStyle === "italic" ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateTextProperty("fontStyle", selectedObject.fontStyle === "italic" ? "normal" : "italic")}
                      >
                        <Italic className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={selectedObject.underline ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateTextProperty("underline", !selectedObject.underline)}
                      >
                        <Underline className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant={selectedObject.textAlign === "left" ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateTextProperty("textAlign", "left")}
                      >
                        <AlignLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={selectedObject.textAlign === "center" ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateTextProperty("textAlign", "center")}
                      >
                        <AlignCenter className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={selectedObject.textAlign === "right" ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateTextProperty("textAlign", "right")}
                      >
                        <AlignRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </>
                )}

                {!isTextObject && selectedObject.stroke && (
                  <div>
                    <Label className="text-sm">Stroke Color</Label>
                    <Input
                      type="color"
                      value={selectedObject.stroke || "#333333"}
                      onChange={(e) => updateTextProperty("stroke", e.target.value)}
                      className="h-10 mt-1"
                    />
                  </div>
                )}

                {isImageObject && (
                  <div>
                    <Label className="text-sm">Opacity</Label>
                    <Slider
                      value={[selectedObject.opacity * 100]}
                      onValueChange={([v]) => updateTextProperty("opacity", v / 100)}
                      min={10}
                      max={100}
                      step={5}
                      className="mt-2"
                    />
                  </div>
                )}

                <div>
                  <Label className="text-sm">Layer Order</Label>
                  <div className="flex gap-2 mt-2">
                    <Button variant="outline" size="sm" onClick={bringForward} className="gap-1 flex-1">
                      <MoveUp className="w-4 h-4" /> Forward
                    </Button>
                    <Button variant="outline" size="sm" onClick={sendBackward} className="gap-1 flex-1">
                      <MoveDown className="w-4 h-4" /> Back
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">Select an element to edit its properties</p>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-border">
              <h4 className="font-medium text-sm mb-3">New Text Settings</h4>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Font</Label>
                  <Select value={selectedFont} onValueChange={setSelectedFont}>
                    <SelectTrigger className="mt-1 h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FONTS.map((font) => (
                        <SelectItem key={font} value={font}>{font}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Size: {fontSize}px</Label>
                  <Slider value={[fontSize]} onValueChange={([v]) => setFontSize(v)} min={8} max={120} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Color</Label>
                  <Input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="h-8 mt-1" />
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <h4 className="font-medium text-sm mb-2">💡 Bulk Generation Tip</h4>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 space-y-2">
                <p className="text-xs text-muted-foreground">
                  To generate multiple certificates with different names:
                </p>
                <ol className="text-xs text-muted-foreground space-y-1 ml-3 list-decimal">
                  <li>Add a text field with <code className="bg-muted px-1 py-0.5 rounded">{"{name}"}</code></li>
                  <li>Style it as you want (font, size, color, position)</li>
                  <li>Save as template</li>
                  <li>Go to Generate page to bulk create certificates</li>
                </ol>
                <p className="text-xs text-muted-foreground italic">
                  The <code className="bg-muted px-1 py-0.5 rounded">{"{name}"}</code> text will be replaced with each person's name while keeping all styling.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default Editor;
