export default function (content, titleError) {
  return content.trim() !== '<p></p>' && !titleError;
}
