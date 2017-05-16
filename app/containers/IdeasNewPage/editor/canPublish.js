export default function (content, titleError, topics, areas) {
  const validTopicsLength = topics.length > 0 && topics.length <= 3;
  const validAreasLength = areas.length > 0 && areas.length <= 3;
  return validTopicsLength && validAreasLength && content.trim() !== '<p></p>' && !titleError;
}
