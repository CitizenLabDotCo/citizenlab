const projectLibraryCountriesKeys = {
  all: (locale?: string) =>
    ['project_library_tenant_countries', ...(locale ? [locale] : [])] as const,
};

export default projectLibraryCountriesKeys;
