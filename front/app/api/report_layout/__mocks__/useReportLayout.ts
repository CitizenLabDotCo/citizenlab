import { ReportLayout } from '../types';

export const reportLayoutData: ReportLayout = {
  id: '1',
  type: 'content_builder_layout',
  attributes: {
    enabled: true,
    code: 'report',
    created_at: '2021-06-29T08:00:00.000Z',
    updated_at: '2021-06-29T08:00:00.000Z',
    craftjs_jsonmultiloc: {
      en: {},
    },
  },
};

export default jest.fn(() => {
  return { data: { data: reportLayoutData } };
});
