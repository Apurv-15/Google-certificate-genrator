import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Award, Sparkles, Zap, Shield, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";

const features = [
  {
    icon: Sparkles,
    title: "Drag & Drop Editor",
    description: "Intuitive canvas editor with full control over text, images, and layout elements.",
  },
  {
    icon: Zap,
    title: "Bulk Generation",
    description: "Upload CSV/Excel files and generate hundreds of certificates in seconds.",
  },
  {
    icon: Shield,
    title: "Instant Verification",
    description: "Each certificate gets a unique ID for easy authenticity verification.",
  },
];

const Index = () => {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4">
        {/* Hero Section */}
        <section className="py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-subtle mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">
                Professional Certificate Studio
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 tracking-tight">
              Create Beautiful
              <br />
              <span className="text-primary">Certificates</span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Design, customize, and generate professional certificates with our
              intuitive editor. Perfect for events, courses, and achievements.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/editor">
                <Button size="lg" className="rounded-xl px-8 h-14 text-lg hover-lift">
                  Get Started
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/verify">
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-xl px-8 h-14 text-lg glass"
                >
                  Verify Certificate
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Floating Elements */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-40 left-20 w-20 h-20 rounded-2xl bg-primary/10 blur-sm hidden lg:block"
          />
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-60 right-20 w-16 h-16 rounded-full bg-accent/30 blur-sm hidden lg:block"
          />
        </section>

        {/* Features Section */}
        <section className="py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-muted-foreground">
              Powerful tools to create and manage professional certificates
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass rounded-2xl p-8 hover-lift cursor-default"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="py-20"
        >
          <div className="glass-strong rounded-3xl p-12 text-center">
            <Award className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ready to Create?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Start designing your certificates today with our intuitive editor
            </p>
            <Link to="/editor">
              <Button size="lg" className="rounded-xl px-10 h-14 text-lg">
                Open Editor
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </motion.section>
      </div>
    </Layout>
  );
};

export default Index;
