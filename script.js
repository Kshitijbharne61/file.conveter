document.addEventListener("DOMContentLoaded", () => {
    // Select elements (make sure these IDs match your index.html)
    const dropZone = document.getElementById("drop-zone");
    const fileInput = document.getElementById("file-input");
    const compressBtn = document.getElementById("compress-btn");
    const qualitySlider = document.getElementById("quality-slider"); // optional range input (0 to 1)
    const downloadSection = document.getElementById("download-section");

    let selectedFile = null;

    // Handle file selection via input
    if (fileInput) {
        fileInput.addEventListener("change", (e) => {
            if (e.target.files.length > 0) {
                selectedFile = e.target.files[0];
                console.log("File selected:", selectedFile.name);
            }
        });
    }

    // Handle Compress Image Click Option
    if (compressBtn) {
        compressBtn.addEventListener("click", () => {
            if (!selectedFile) {
                alert("Please select or upload an image file first!");
                return;
            }

            if (!selectedFile.type.startsWith("image/")) {
                alert("The selected file is not a valid image.");
                return;
            }

            // Get quality value from slider or default to 0.7 (70%)
            const quality = qualitySlider ? parseFloat(qualitySlider.value) : 0.7;

            compressImage(selectedFile, quality, (compressedBlob, compressedUrl) => {
                // Trigger download or display result
                triggerDownload(compressedUrl, `compressed-${selectedFile.name}`);
            });
        });
    }

    // Core Compression Function using HTML5 Canvas
    function compressImage(file, quality, callback) {
        const reader = new FileReader();
        reader.onload = function (event) {
            const img = new Image();
            img.onload = function () {
                const canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);

                // Convert to Blob with specified quality
                canvas.toBlob(
                    (blob) => {
                        const url = URL.createObjectURL(blob);
                        callback(blob, url);
                    },
                    file.type,
                    quality
                );
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }

    // Helper to trigger file download automatically
    function triggerDownload(url, filename) {
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        console.log("Compression complete. Download started.");
    }
});
