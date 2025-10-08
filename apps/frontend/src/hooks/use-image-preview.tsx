import { useEffect, useState } from "react";

const useImagePreview = (file: FileList | File | undefined) => {
  const [imgSrc, setImgSrc] = useState<string | undefined>();

  useEffect(() => {
    if (!file) {
      setImgSrc(undefined);
      return;
    }

    const fileToRead = file instanceof FileList ? file[0] : file;

    if (fileToRead) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImgSrc(reader.result as string);
      };
      reader.readAsDataURL(fileToRead);
    }
  }, [file]);

  return imgSrc;
};

export default useImagePreview;

const useImageString = (file: FileList | File | undefined) => {
  const [imgSrc, setImgSrc] = useState<ArrayBuffer | string | undefined>();

  useEffect(() => {
    if (!file) {
      setImgSrc(undefined);
      return;
    }

    const fileToRead = file instanceof FileList ? file[0] : file;

    if (fileToRead) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImgSrc(reader.result);
      };
      reader.readAsArrayBuffer(fileToRead);
    }
  }, [file]);

  return imgSrc;
};

export { useImageString };
