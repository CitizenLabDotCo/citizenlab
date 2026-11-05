// Requirements : multiloc fields must en with _multiloc, you can't nest multilocs.

export function getFieldNameFromPath(val: string) {
  let pathChuncks = val.split('.');
  if (pathChuncks.length === 1) {
    pathChuncks = val.split('/');
  }
  if (pathChuncks.length <= 1) {
    return val;
  } else {
    return (
      pathChuncks.find((chunck) => chunck.endsWith('_multiloc')) ||
      pathChuncks[pathChuncks.length - 1]
    );
  }
}

export const sanitizeForClassname = (val: string) =>
  val.replace(/#|\/|\./g, '');

export const getElementType = (uiSchema, name: string): string | undefined => {
  const elementType = uiSchema.elements
    ?.flatMap((category) => category.elements)
    .filter((element) => element.scope?.split('/').pop() === name)
    .map((element) => element.options.input_type);
  return elementType?.length ? elementType[0] : undefined;
};
