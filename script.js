// Image Compressor - client-side, no upload required

function formatBytes(bytes) {
    if (!bytes) return "0 Bytes";
    const units = ["Bytes", "KB", "MB", "GB"];
    const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 2)} ${units[i]}`;
}

function compressImage(file, quality, callback) {
    if (!file || !file.type.startsWith("image/")) {
        alert("Please select a valid image file.");
        return;
    }

    const reader = new FileReader();
    reader.onload = event => {
        const img = new Image();
        img.onload = () => {
            // Limit very large images so compression actually reduces size reliably.
            const maxDimension = 2400;
            const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
            const width = Math.max(1, Math.round(img.width * scale));
            const height = Math.max(1, Math.round(img.height * scale));

            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");

            // JPEG/WebP need a background for transparent PNGs when converting.
            const outputType = file.type === "image/png" ? "image/webp" : "image/jpeg";
            if (outputType === "image/jpeg") {
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(0, 0, width, height);
            }
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(blob => {
                if (!blob) {
                    alert("Could not compress this image. Please try another image.");
                    return;
                }
                const url = URL.createObjectURL(blob);
                callback(blob, url, width, height, outputType);
            }, outputType, quality);
        };
        img.onerror = () => alert("Could not read the selected image.");
        img.src = event.target.result;
    };
    reader.onerror = () => alert("Could not read the selected file.");
    reader.readAsDataURL(file);
}

function triggerDownload(url, filename) {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Supports the existing standalone compressor controls, if present.
document.addEventListener("DOMContentLoaded", () => {
    const dropZone = document.getElementById("drop-zone");
    const fileInput = document.getElementById("file-input");
    const compressBtn = document.getElementById("compress-btn");
    const qualitySlider = document.getElementById("quality-slider");

    let selectedFile = null;

    if (fileInput) {
        fileInput.addEventListener("change", e => {
            selectedFile = e.target.files?.[0] || null;
        });
    }

    if (dropZone && fileInput) {
        dropZone.addEventListener("click", () => fileInput.click());
        dropZone.addEventListener("dragover", e => {
            e.preventDefault();
            dropZone.classList.add("ring-2", "ring-red-400");
        });
        dropZone.addEventListener("dragleave", () => {
            dropZone.classList.remove("ring-2", "ring-red-400");
        });
        dropZone.addEventListener("drop", e => {
            e.preventDefault();
            dropZone.classList.remove("ring-2", "ring-red-400");
            selectedFile = e.dataTransfer.files?.[0] || null;
        });
    }

    if (compressBtn) {
        compressBtn.addEventListener("click", () => {
            if (!selectedFile) {
                alert("Please select or upload an image file first!");
                return;
            }
            const quality = qualitySlider ? Math.min(1, Math.max(0.1, parseFloat(qualitySlider.value))) : 0.7;
            compressImage(selectedFile, quality, (blob, url) => {
                const extension = blob.type === "image/webp" ? "webp" : "jpg";
                triggerDownload(url, `compressed-${selectedFile.name.replace(/\.[^/.]+$/, "")}.${extension}`);
            });
        });
    }
});

// Used by the tool modal in style.js.
window.compressSelectedImage = function(file, quality = 0.7) {
    return new Promise((resolve, reject) => {
        compressImage(file, quality, (blob, url, width, height, outputType) => {
            resolve({ blob, url, width, height, outputType });
        });
    });
};
