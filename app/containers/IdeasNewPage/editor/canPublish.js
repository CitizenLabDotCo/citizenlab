export default function (content, titleError, topics, areas) {
  return content.trim() !== '<p></p>' && !titleError && topics.length > 0 && areas.length > 0;
}
