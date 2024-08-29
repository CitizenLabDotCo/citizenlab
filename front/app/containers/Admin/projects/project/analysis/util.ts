export const handleArraySearchParam = (
  searchParams: URLSearchParams,
  paramName: string
) => {
  const result: string[] | undefined =
    searchParams.get(paramName) &&
    typeof searchParams.get(paramName) === 'string'
      ? JSON.parse(searchParams.get(paramName) as string)
      : undefined;

  return result;
};
