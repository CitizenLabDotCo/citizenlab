import { PageType } from '../typings';

const getFilteredDataForUserPath = (userRoute: PageType[], data: any) => {
  const filteredData = { data: { ...data } };

  for (const key in data) {
    const value = data[key];
    filteredData.data[key] = keyPresentInPageRoute(key, userRoute)
      ? value
      : undefined;
  }

  return filteredData;
};

export default getFilteredDataForUserPath;

const keyPresentInPageRoute = (key: string, userPageRoute: PageType[]) => {
  if (key === 'publication_status') {
    return true;
  }
  let isFound = false;
  userPageRoute.forEach((page) => {
    const currentPageElementNames = page.elements.map((uiSchemaElement) =>
      uiSchemaElement.scope.split('/').pop()
    );
    isFound ||= currentPageElementNames.includes(key);
  });
  return isFound;
};
