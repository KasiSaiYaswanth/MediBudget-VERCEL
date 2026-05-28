import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { toast } from "sonner";

interface DownloadOptions {
  fileName: string;
  content: string;
  mimeType: string;
}

/**
 * Robust utility to download or share files on both Web and native Android Capacitor platforms.
 */
export const downloadFile = async ({ fileName, content, mimeType }: DownloadOptions) => {
  const isNative = Capacitor.isNativePlatform();

  if (isNative) {
    let loadingToastId = "";
    try {
      loadingToastId = toast.loading(`Generating native file: ${fileName}...`);

      // Write the file locally to Cache directory (highly reliable, bypassing permission prompts)
      const writeResult = await Filesystem.writeFile({
        path: fileName,
        data: content,
        directory: Directory.Cache,
        encoding: Encoding.UTF8,
      });

      toast.dismiss(loadingToastId);
      toast.success(`"${fileName}" generated! Opening Android save & share panel...`);

      // Trigger the native Android Share sheet
      // This allows the user to click "Save to Downloads", send via WhatsApp/Email, or open in visualizers.
      await Share.share({
        title: `MediBudget - ${fileName}`,
        text: `Exported MediBudget File: ${fileName}`,
        url: writeResult.uri,
        dialogTitle: `Save or Share ${fileName}`,
      });

    } catch (error: any) {
      if (loadingToastId) toast.dismiss(loadingToastId);
      console.error("Android native file download error", error);
      toast.error(`Local generation failed: ${error.message || "Please check storage permissions."}`);
    }
  } else {
    // Standard Web/Browser download handling
    try {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      
      // Clean up anchor tag and object URL
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(`"${fileName}" downloaded successfully!`);
    } catch (error: any) {
      console.error("Web file download error", error);
      toast.error(`Web download failed: ${error.message || "Unknown error"}`);
    }
  }
};
