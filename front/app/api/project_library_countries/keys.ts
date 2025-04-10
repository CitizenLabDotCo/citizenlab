const projectLibraryCountriesKeys = {
  all: (locale?: string) =>
    ['project_library_countries', ...(locale ? [locale] : [])] as const,
};

export default projectLibraryCountriesKeys;
