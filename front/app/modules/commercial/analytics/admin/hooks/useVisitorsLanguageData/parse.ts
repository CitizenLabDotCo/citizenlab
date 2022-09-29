import { Response, PieRow } from './typings';

// styling
import { categoricalColorScheme } from 'components/admin/Graphs/styling';

export const parsePieData = (data: Response['data']): PieRow[] =>
  data.map((row, i) => ({
    name: row.first_dimension_locales_name,
    value: row.count,
    color: categoricalColorScheme({ rowIndex: i }),
  }));
