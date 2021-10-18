declare var CL_CONFIG: any;

export default function useModuleEnabled(moduleName: string) {
  return !!CL_CONFIG.modules[moduleName];
}
