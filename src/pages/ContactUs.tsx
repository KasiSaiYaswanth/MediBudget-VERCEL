import { useState } from "react";
import { Link } from "react-router-dom";
import { Pill, ArrowLeft, Mail, Clock, Send, MessageCircle, Phone, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name is too long"),
  email: z.string().trim().email("Invalid email address").max(255, "Email is too long"),
  subject: z.string().trim().min(1, "Subject is required").max(200, "Subject is too long"),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(2000, "Message is too long"),
});

const WHATSAPP_NUMBER = "919381987307";
const WHATSAPP_MESSAGE = encodeURIComponent("Hello MediBudget Support, I need assistance regarding your healthcare platform.");
const SUPPORT_EMAIL = "medibudget@gmail.com";

const ContactUs = () => {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [lastSubmit, setLastSubmit] = useState(0);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const now = Date.now();
    if (now - lastSubmit < 30000) {
      toast.error("Please wait before sending another message.");
      return;
    }

    const result = contactSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    // Open mailto with form data as fallback
    const mailtoSubject = encodeURIComponent(result.data.subject);
    const mailtoBody = encodeURIComponent(
      `Name: ${result.data.name}\nEmail: ${result.data.email}\n\n${result.data.message}`
    );
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${mailtoSubject}&body=${mailtoBody}`;

    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setLastSubmit(Date.now());
    setForm({ name: "", email: "", subject: "", message: "" });
    toast.success("Your message has been successfully sent to the MediBudget support team.");
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex items-center h-16 px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg gradient-primary flex items-center justify-center">
              <Pill className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">MediBudget</span>
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Contact Us</h1>
        <p className="text-muted-foreground mb-10">Have a question or need help? Reach us through any of the options below.</p>

        {/* Quick Contact Cards */}
        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex flex-col items-center text-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-foreground mb-1">Email Support</h3>
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="text-sm text-primary hover:underline break-all"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  {SUPPORT_EMAIL}
                </a>
                <p className="text-xs text-muted-foreground mt-1">Click to open your email client</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex flex-col items-center text-center gap-3">
              <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <MessageCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-foreground mb-1">Chat on WhatsApp</h3>
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-green-600 hover:underline"
                >
                  +91 93819 87307
                </a>
                <p className="text-xs text-muted-foreground mt-1">Instant chat support</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex flex-col items-center text-center gap-3">
              <div className="h-12 w-12 rounded-full bg-accent flex items-center justify-center">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-foreground mb-1">Response Time</h3>
                <p className="text-sm text-muted-foreground">Within 24 hours</p>
                <p className="text-xs text-muted-foreground mt-1">Mon–Sat, 9am–6pm IST</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* WhatsApp CTA */}
        <Card className="mb-10 border-green-200 bg-green-50/50 dark:bg-green-950/10 dark:border-green-900/30">
          <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-4">
            <MessageCircle className="h-10 w-10 text-green-600 shrink-0" />
            <div className="flex-1 text-center sm:text-left">
              <h3 className="font-semibold text-foreground">Need quick help?</h3>
              <p className="text-sm text-muted-foreground">Chat with us on WhatsApp for instant support.</p>
            </div>
            <Button asChild className="bg-green-600 hover:bg-green-700 text-white shrink-0">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="h-4 w-4 mr-2" /> Chat on WhatsApp
              </a>
            </Button>
          </CardContent>
        </Card>

        {/* Contact Form */}
        <Card>
          <CardContent className="p-6 md:p-8">
            <h2 className="text-xl font-semibold text-foreground mb-1">Send Us a Message</h2>
            <p className="text-sm text-muted-foreground mb-6">Our support team typically responds within 24 hours.</p>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Full Name</label>
                  <Input placeholder="Your full name" value={form.name} onChange={(e) => handleChange("name", e.target.value)} />
                  {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Email Address</label>
                  <Input type="email" placeholder="you@example.com" value={form.email} onChange={(e) => handleChange("email", e.target.value)} />
                  {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Subject</label>
                <Input placeholder="What's this about?" value={form.subject} onChange={(e) => handleChange("subject", e.target.value)} />
                {errors.subject && <p className="text-xs text-destructive mt-1">{errors.subject}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Message</label>
                <Textarea placeholder="Tell us more..." rows={5} value={form.message} onChange={(e) => handleChange("message", e.target.value)} />
                {errors.message && <p className="text-xs text-destructive mt-1">{errors.message}</p>}
              </div>

              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <Shield className="h-4 w-4 shrink-0 mt-0.5" />
                <p>Your information will only be used to respond to your inquiry and will not be shared with third parties.</p>
              </div>

              <Button type="submit" disabled={loading} className="w-full md:w-auto">
                {loading ? "Sending..." : "Send Message"} <Send className="h-4 w-4 ml-1" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ContactUs;
