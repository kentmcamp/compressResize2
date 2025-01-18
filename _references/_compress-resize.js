const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

// Change the values of these constants to suit your needs
const inputDir = path.join(__dirname, "images-input");
const outputDir = path.join(__dirname, "images-output");
const fallbacksDir = path.join(outputDir, "fallbacks");

// Make MAX_WIDTH 0 to skip resizing completely
const MAX_WIDTH = 0;
const COMPRESSION_QUALITY = 85;

// Function to calculate the total size of a directory and its contents
async function getTotalSize(directory, excludeDir = null) {
  const files = await fs.promises.readdir(directory);
  let totalSize = 0;

  for (const file of files) {
    const filePath = path.join(directory, file);
    const stat = await fs.promises.stat(filePath);

    if (stat.isDirectory()) {
      if (excludeDir && filePath === excludeDir) continue;
      totalSize += await getTotalSize(filePath, excludeDir);
    } else {
      totalSize += stat.size;
    }
  }

  return totalSize;
}

(async () => {
  try {
    // Ensures the output and fallbacks directories exist
    await fs.promises.mkdir(outputDir, { recursive: true });
    await fs.promises.mkdir(fallbacksDir, { recursive: true });

    // Calculate the total size of images in the input directory
    const originalTotalSize = await getTotalSize(inputDir);

    // Filters out only specified image files from the input directory
    const imageFiles = fs
      .readdirSync(inputDir)
      .filter((file) => /\.(jpe?g|png|gif|webp|jfif|tiff|bmp)$/i.test(file));

    const totalImages = imageFiles.length;
    let processedImages = 0;

    // Resizes images using sharp and saves them to the output directory
    for (const file of imageFiles) {
      try {
        console.log(`Processing image: ${file}`);

        // Define the input and output file paths with the appropriate extensions
        const inputFilePath = path.join(inputDir, file);
        const outputFilePath = path.join(
          outputDir,
          path.parse(file).name + ".webp"
        );
        const fallbackFilePath = path.join(fallbacksDir, file);

        // Read the image file and get its metadata
        let image = sharp(inputFilePath);
        const metadata = await image.metadata();

        // If MAX_WIDTH is set, resize the image only if its width exceeds the specified value
        if (MAX_WIDTH !== 0) {
          if (metadata.width > MAX_WIDTH) {
            image = image.resize({ width: MAX_WIDTH });
          }
        }

        // Convert the image to the desired format and compression quality and save it to the output directory
        await image
          .toFormat(metadata.format, { quality: COMPRESSION_QUALITY })
          .toFile(fallbackFilePath);

        await image.webp({ quality: COMPRESSION_QUALITY }).toFile(outputFilePath);

        // Console log the progress of the image processing job
        processedImages++;
        console.log(`Finished processing image: ${file}`);
        console.log(
          `Total Progress: ${((processedImages / totalImages) * 100).toFixed(2)}%`
        );
        console.log(``); // Empty line for spacing
      } catch (error) {
        console.error(`Error processing image ${file}:`, error);
      }
    }

    // Calculate the total size of images in the output directory (excluding fallbacks)
    const newTotalSize = await getTotalSize(outputDir, fallbacksDir);

    // Calculate the percentage reduction in file size
    const sizeReduction = ((originalTotalSize - newTotalSize) / originalTotalSize) * 100;

    // Console log the results of the image processing job
    console.log("Image processing complete.");
    console.log(`Processed images can be found at ${outputDir}.`);
    console.log(`Original Total Size: ${(originalTotalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`New Total Size: ${(newTotalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`This is a file size reduction of ${sizeReduction.toFixed(2)}%`);
  } catch (error) {
    console.error("An error occurred during the image processing job:", error);
  }
})();
