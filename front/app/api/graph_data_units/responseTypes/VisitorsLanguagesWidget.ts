import { SupportedLocale } from 'typings';

export interface VisitorsLanguagesResponse {
  data: {
    type: 'report_builder_data_units';
    attributes: {
      sessions_per_locale: Record<SupportedLocale, number>;
    };
  };
}
