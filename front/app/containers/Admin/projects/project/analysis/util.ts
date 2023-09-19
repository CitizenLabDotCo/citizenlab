export const handleArraySearchParam = (
  searchParams: URLSearchParams,
  paramName: string
) => {
  const result: string[] | undefined = searchParams.get(paramName)
    ? JSON.parse(searchParams.get(paramName) as string)
    : undefined;

  return result;
};
