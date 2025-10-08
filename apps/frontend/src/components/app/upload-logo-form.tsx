import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { DataItem } from "arbundles";
import { useActiveAddress } from "arweave-wallet-kit";
import imageCompression from "browser-image-compression";

const MAX_FILE_SIZE = 1000000;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const compressImage = async (file: File): Promise<File> => {
  const options = {
    maxSizeMB: 0.1, // 100KB
    maxWidthOrHeight: 256,
    useWebWorker: true,
  };

  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    console.error("Error compressing image:", error);
    throw error;
  }
};

export function UploadLogoForm({
  handleUploadLogo,
  currentLogo,
}: {
  handleUploadLogo: (txid: string) => void;
  currentLogo?: string;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const userAddress = useActiveAddress();

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return "Max file size is 1MB.";
    }
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return ".jpg, .jpeg, .png and .webp files are accepted.";
    }
    return null;
  };

  const uploadToArweave = async (file: File) => {
    setIsLoading(true);
    setUploadProgress(25);
    try {
      const compressedFile = await compressImage(file);

      const arrayBuffer = await compressedFile.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      const signed = await (window.arweaveWallet as any).signDataItem({
        data: uint8Array,
        tags: [
          {
            name: "Content-Type",
            value: file.type,
          },
          {
            name: "App",
            value: "CoinMaker",
          },
        ],
      });

      // load the result into a DataItem instance
      const dataItem = new DataItem(signed);

      // now you can submit it to a bunder
      const upload = await fetch("https://upload.ardrive.io/v1/tx", {
        method: "POST",
        headers: {
          "Content-Type": "application/octet-stream",
          accept: "application/json",
        },
        body: dataItem.getRaw(),
      });

      // Get the response from upload
      const response = await upload.json();

      console.log("response", response);

      if (response.id) {
        toast.success("Logo uploaded successfully!", {
          description: "Your logo has been uploaded to Arweave.",
        });

        handleUploadLogo(response.id);
      } else {
        throw new Error("Transaction ID not found.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while uploading the logo.", {
        description: JSON.stringify(error),
      });
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const validationError = validateFile(file);
      if (validationError) {
        toast.error(validationError);
        return;
      }

      setPreview(URL.createObjectURL(file));
      await uploadToArweave(file);
    }
  };

  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    fileInputRef.current?.click();
  };

  if (!userAddress) {
    return (
      <FormItem>
        <FormLabel className="w-full h-32 border border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary relative">
          <div className="text-center">
            <p>Connect your wallet to upload logo</p>
          </div>
        </FormLabel>
        <FormControl>
          <input
            type="file"
            accept={ACCEPTED_IMAGE_TYPES.join(",")}
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
            onClick={(event) => event.stopPropagation()}
            disabled={true}
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    );
  }

  return (
    <FormItem>
      <FormLabel
        className="w-full h-32 border border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary relative"
        onClick={handleClick}
      >
        {uploadProgress > 0 && uploadProgress < 100 ? (
          <div className="flex flex-col items-center w-full">
            <Loader2 className="h-6 w-6 animate-spin mb-2" />
            <p className="text-sm mb-2">Uploading... {uploadProgress}%</p>
            <Progress value={uploadProgress} className="w-3/4" />
          </div>
        ) : preview || currentLogo ? (
          <img
            src={preview || `https://arweave.net/${currentLogo}`}
            alt="Logo preview"
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="text-center">
            <p>Click to upload logo</p>
            <p className="text-sm text-gray-500">PNG, JPG, WebP up to 1MB</p>
          </div>
        )}
      </FormLabel>
      <FormControl>
        <input
          type="file"
          accept={ACCEPTED_IMAGE_TYPES.join(",")}
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
          onClick={(event) => event.stopPropagation()}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}
