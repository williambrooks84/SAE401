export const compressImage = async (file: File, maxSizeMB: number, maxWidthOrHeight: number): Promise<File> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();

        reader.onload = (e) => {
            if (!e.target?.result) return reject("Failed to read file");
            img.src = e.target.result as string;
        };

        img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            if (!ctx) return reject("Failed to get canvas context");

            let width = img.width;
            let height = img.height;

            if (width > height && width > maxWidthOrHeight) {
                height *= maxWidthOrHeight / width;
                width = maxWidthOrHeight;
            } else if (height > width && height > maxWidthOrHeight) {
                width *= maxWidthOrHeight / height;
                height = maxWidthOrHeight;
            }

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
                (blob) => {
                    if (!blob) return reject("Failed to create blob");
                    if (blob.size / 1024 / 1024 > maxSizeMB) {
                        return reject("Compressed file is still too large");
                    }
                    resolve(new File([blob], file.name, { type: file.type }));
                },
                file.type,
                 // Quality (0.8 = 80%)
            );
        };

        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
};