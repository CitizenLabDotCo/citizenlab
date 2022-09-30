import { Response, PieRow } from './typings';
import { colors } from 'components/admin/Graphs/styling';
import { XlsxData } from 'components/admin/ReportExportMenu';

// styling
// import { categoricalColorScheme } from 'components/admin/Graphs/styling';

export const parsePieData = (data: Response['data']): PieRow[] => {
  const usersByAction = data.map(
    (row) =>
      row.first_dimension_date_first_action_date ===
      row.first_dimension_date_last_action_date
  );
  const newUsers = usersByAction.filter((v) => v).length;
  const oldUsers = usersByAction.filter((v) => !v).length;
  return [
    {
      name: 'new users',
      value: newUsers,
      color: colors.categorical01,
    },
    {
      name: 'recurring users',
      value: oldUsers,
      color: colors.categorical02,
    },
  ];
};

export const parseXlsxData = (data: Response['data']): XlsxData => ({
  sheet: data,
});
