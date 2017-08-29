export default function (content, titleError, topics, areas, projects) {
  const validTopicsLength = topics.length > 0 && topics.length <= 3;
  const validAreasLength = areas.length > 0 && areas.length <= 3;
  const validProjectsLength = projects.length <= 1;
  return validTopicsLength && validAreasLength && validProjectsLength && content.trim() !== '<p></p>' && !titleError;
}
