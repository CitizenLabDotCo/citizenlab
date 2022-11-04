// Base types
type ColumnName<
  Prefix extends string,
  Period extends 'month' | 'week' | 'date'
> = `${Prefix}.${Period}`;

type Month<Prefix extends string> = ColumnName<Prefix, 'month'>;
type Week<Prefix extends string> = ColumnName<Prefix, 'week'>;

// Function using data
// const get = <Prefix extends string>(prefix: Prefix) => (row: MonthRow<Prefix> | WeekRow<Prefix>) => {
//   const monthColumn: PossibleColumnNames<Prefix, 'month'> = `${prefix}.month`;

//   if (monthColumn in row) {
//     console.log(row)
//   }
// }

const get =
  <Prefix extends string>(prefix: Prefix) =>
  (x: Month<Prefix> | Week<Prefix>) => {
    const monthColumn: ColumnName<Prefix, 'month'> = `${prefix}.month`;

    if (monthColumn === x) {
      console.log(x);
    }
  };
