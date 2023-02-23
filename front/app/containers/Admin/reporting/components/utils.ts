import { IAppConfigurationData } from 'services/appConfiguration';

export const shouldShowReportBuilderTab = (
  appConfig: IAppConfigurationData
) => {
  const isReportBuilderAllowed =
    appConfig.attributes.settings.report_builder?.allowed;

  const isReportBuilderEnabled =
    appConfig.attributes.settings.report_builder?.enabled;

  // We don't show the report builder tabs if the feature flag is allowed but was intentionally disabled
  return !(isReportBuilderAllowed && !isReportBuilderEnabled);
};
