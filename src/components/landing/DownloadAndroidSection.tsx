import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Smartphone, ShieldCheck, ArrowRight, Info, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const DownloadAndroidSection = () => {
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = () => {
    setDownloaded(true);
    // Trigger download
    const link = document.createElement("a");
    link.href = "/medibudget.apk";
    link.download = "medibudget.apk";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section id="download-app" className="py-24 relative overflow-hidden bg-background">
      {/* Decorative background glows */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-emerald-500/5 dark:bg-emerald-500/10 blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 max-w-5xl">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Left content side */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <Smartphone className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Mobile Experience</span>
            </div>

            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
              MediBudget in Your Pocket. <br />
              <span className="text-gradient">Install the Android App</span>
            </h2>

            <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-xl">
              Get all features of the healthcare cost intelligence platform directly on your mobile device. Scan prescription bottles, estimate clinic costs, and manage your insurance limits offline, anytime.
            </p>

            {/* Quality assurances */}
            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              {[
                { text: "100% Secure APK Package", desc: "Cryptographically verified" },
                { text: "Zero Tracking / Ads", desc: "Fully privacy focused" },
                { text: "Offline Capabilities", desc: "No internet required for estimation" },
                { text: "Automatic Sync", desc: "Data stays updated with the web" },
              ].map((item, i) => (
                <div key={i} className="flex gap-3">
                  <div className="h-5 w-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground leading-none mb-1">{item.text}</h4>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Action/Card side */}
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="border border-emerald-500/10 dark:border-emerald-500/20 shadow-2xl relative bg-secondary/10 dark:bg-[#0c1417]/40 backdrop-blur-md rounded-3xl overflow-hidden">
                <CardContent className="p-6 md:p-8 space-y-6">
                  {/* Card Header & Badges */}
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/25 shrink-0">
                        {/* Android custom SVG icon */}
                        <svg className="h-6 w-6 text-[#070e11]" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M16.607 10.749A.761.761 0 0 0 15.85 10a.761.761 0 0 0-.757.749v3.003a.761.761 0 0 0 .757.748.761.761 0 0 0 .757-.748v-3.003zM8.907 10.749A.761.761 0 0 0 8.15 10a.761.761 0 0 0-.757.749v3.003c0 .412.34.748.757.748a.761.761 0 0 0 .757-.748v-3.003zM12 2A10 10 0 0 0 2 12a10 10 0 0 0 10 10 10 10 0 0 0 10-10A10 10 0 0 0 12 2zm4.35 15.4h-1.5v2.25a.75.75 0 0 1-1.5 0v-2.25h-2.7v2.25a.75.75 0 0 1-1.5 0v-2.25H7.65c-.825 0-1.5-.675-1.5-1.5V11.2h11.7v4.2c0 .825-.675 1.5-1.5 1.5zm1.5-6.95H6.15V9.75c0-.825.675-1.5 1.5-1.5H9v-.6a3 3 0 0 1 6 0v.6h1.35c.825 0 1.5.675 1.5 1.5v.7z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground">MediBudget App</h3>
                        <p className="text-xs text-muted-foreground">For Android Devices</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5 items-end">
                      <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        v1.0.4 Stable
                      </Badge>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-[1px] w-full bg-emerald-500/5 dark:bg-emerald-500/10" />

                  {/* Primary Action Button */}
                  <div className="space-y-3">
                    <Button
                      onClick={handleDownload}
                      className="w-full h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 hover:from-emerald-600 hover:to-teal-500 text-[#070e11] font-black text-sm shadow-xl shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group relative overflow-hidden"
                    >
                      <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <Download className="h-5 w-5 animate-bounce group-hover:scale-110 transition-transform" />
                      <span>Download for Android</span>
                    </Button>
                    
                    <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                      <span>APK • Secure Direct Download</span>
                    </div>
                  </div>

                  {/* Conditional Success Alert */}
                  {downloaded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-center"
                    >
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center gap-1.5">
                        <Info className="h-4 w-4 shrink-0" />
                        Download started! Follow installation steps below.
                      </p>
                    </motion.div>
                  )}

                  {/* Installation Instructions Dropdown */}
                  <div className="space-y-2 pt-2">
                    <h4 className="text-xs font-black uppercase text-muted-foreground/80 tracking-wider flex items-center gap-1.5">
                      <HelpCircle className="h-3.5 w-3.5 text-emerald-500" />
                      Installation Guide
                    </h4>
                    
                    <Accordion type="single" collapsible className="w-full space-y-1">
                      <AccordionItem value="step-1" className="border-none bg-emerald-500/5 dark:bg-emerald-500/[0.02] rounded-xl px-4 py-1">
                        <AccordionTrigger className="text-xs font-semibold py-2.5 hover:no-underline text-foreground">
                          1. Download the APK file
                        </AccordionTrigger>
                        <AccordionContent className="text-xs text-muted-foreground leading-relaxed pt-1 pb-3">
                          Tap the button above. If prompted with a warning like "File might be harmful", tap <strong>Download anyway</strong>. This warning shows for all direct APK files not installed from the Play Store.
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="step-2" className="border-none bg-emerald-500/5 dark:bg-emerald-500/[0.02] rounded-xl px-4 py-1">
                        <AccordionTrigger className="text-xs font-semibold py-2.5 hover:no-underline text-foreground">
                          2. Enable "Unknown Sources"
                        </AccordionTrigger>
                        <AccordionContent className="text-xs text-muted-foreground leading-relaxed pt-1 pb-3">
                          Open the downloaded file or navigate to your phone's <strong>Downloads</strong> folder. Tap the APK. If Android prompts you for security settings, click <strong>Settings</strong> and toggle on <strong>"Allow from this source"</strong> (e.g. for Google Chrome or File Manager).
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="step-3" className="border-none bg-emerald-500/5 dark:bg-emerald-500/[0.02] rounded-xl px-4 py-1">
                        <AccordionTrigger className="text-xs font-semibold py-2.5 hover:no-underline text-foreground">
                          3. Complete Installation
                        </AccordionTrigger>
                        <AccordionContent className="text-xs text-muted-foreground leading-relaxed pt-1 pb-3">
                          Go back to the installation screen, tap <strong>Install</strong>, and within seconds the MediBudget app icon will appear in your launcher ready to launch!
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                  
                </CardContent>
              </Card>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default DownloadAndroidSection;
