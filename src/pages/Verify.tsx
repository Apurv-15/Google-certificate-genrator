import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Shield, CheckCircle2, XCircle, Award, Calendar, FileText, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Layout } from "@/components/layout/Layout";
import { verifyCertificate, GeneratedCertificate } from "@/lib/certificate-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Verify = () => {
  const [certId, setCertId] = useState("");
  const [result, setResult] = useState<GeneratedCertificate | null | undefined>(undefined);
  const [isSearching, setIsSearching] = useState(false);

  const handleVerify = async () => {
    if (!certId.trim()) return;

    setIsSearching(true);

    try {
      const found = await verifyCertificate(certId.trim());
      setResult(found ?? null);
    } catch (error) {
      console.error(error);
      setResult(null);
    } finally {
      setIsSearching(false);
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Verify Certificate
          </h1>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto">
            Enter a certificate ID to verify its authenticity and view details
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-strong rounded-2xl p-8 mb-8"
        >
          <div className="flex gap-3">
            <Input
              placeholder="Enter Certificate ID (e.g., CERT-25-ABC123)"
              value={certId}
              onChange={(e) => setCertId(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleVerify()}
              className="h-14 text-lg px-5 rounded-xl"
            />
            <Button
              onClick={handleVerify}
              disabled={!certId.trim() || isSearching}
              className="h-14 px-8 rounded-xl"
            >
              {isSearching ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
            </Button>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {result !== undefined && (
            <motion.div
              key={result ? "found" : "not-found"}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.3 }}
            >
              {result ? (
                <Card className="glass-strong border-0 overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-green-400 to-emerald-500" />
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      </div>
                      Certificate Verified
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="bg-muted/30 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <User className="w-4 h-4" />
                          <span className="text-sm">Recipient</span>
                        </div>
                        <p className="font-semibold text-lg text-foreground">
                          {result.recipientName}
                        </p>
                      </div>

                      <div className="bg-muted/30 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <Award className="w-4 h-4" />
                          <span className="text-sm">Certificate ID</span>
                        </div>
                        <p className="font-mono font-semibold text-lg text-foreground">
                          {result.certId}
                        </p>
                      </div>

                      <div className="bg-muted/30 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <FileText className="w-4 h-4" />
                          <span className="text-sm">Template</span>
                        </div>
                        <p className="font-semibold text-foreground">
                          {result.templateName}
                        </p>
                      </div>

                      <div className="bg-muted/30 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">Issue Date</span>
                        </div>
                        <p className="font-semibold text-foreground">
                          {formatDate(result.generatedAt)}
                        </p>
                      </div>
                    </div>

                    {result.imageData && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-3">Certificate Preview</p>
                        <img
                          src={result.imageData}
                          alt="Certificate"
                          className="w-full rounded-xl border border-border shadow-lg"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card className="glass-strong border-0 overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-red-400 to-rose-500" />
                  <CardContent className="py-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                      <XCircle className="w-8 h-8 text-destructive" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Certificate Not Found
                    </h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      The certificate ID "{certId}" could not be verified. Please check the ID and try again.
                    </p>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {result === undefined && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center py-12 text-muted-foreground"
          >
            <Shield className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p>Enter a certificate ID above to verify</p>
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default Verify;
