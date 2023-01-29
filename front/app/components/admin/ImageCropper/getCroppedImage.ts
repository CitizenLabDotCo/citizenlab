const createImage = (url: string): Promise<any> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });

const getCroppedImage = async (
  imageSrc: string,
  pixelCrop: { height: number; width: number; x: number; y: number }
): Promise<any> => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const canvasContext = canvas.getContext('2d');

  if (!canvasContext) {
    return null;
  }

  // set canvas size to match the bounding box
  canvas.width = image.width;
  canvas.height = image.height;

  // translate canvas context to a central location to allow rotating and flipping around the center
  canvasContext.translate(image.width / 2, image.height / 2);

  canvasContext.scale(1, 1);
  canvasContext.translate(-image.width / 2, -image.height / 2);

  // draw rotated image
  canvasContext.drawImage(image, 0, 0);

  // croppedAreaPixels values are bounding box relative
  // extract the cropped image using these values
  const data = canvasContext.getImageData(
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height
  );

  // set canvas width to final desired crop size - this will clear existing context
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // paste generated rotate image at the top left corner
  canvasContext.putImageData(data, 0, 0);

  // As Base64 string
  return canvas.toDataURL('image/jpeg');
};

export default getCroppedImage;
