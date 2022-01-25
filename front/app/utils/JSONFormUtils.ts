// Requirements : multiloc fields must en with _multiloc, you can't nest multilocs.

export function getFieldNameFromPath(val: string) {
  const pathChuncks = val.split('.');
  if (pathChuncks.length <= 1) {
    return val;
  } else {
    return (
      pathChuncks.find((chunck) => chunck.endsWith('_multiloc')) ||
      pathChuncks[pathChuncks.length - 1]
    );
  }
}
