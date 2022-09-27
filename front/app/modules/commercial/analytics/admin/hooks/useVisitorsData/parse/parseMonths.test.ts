import {
  getEmptyMonthsBefore,
  getEmptyMonthsAfter,
  getFirstDayOfMonth
} from './parseMonths'
import { range } from 'lodash-es'
import moment from 'moment';

const toEmptyMonth = (year: number) => (month: number) => ({
  visitors: 0,
  visits: 0,
  date: getFirstDayOfMonth(year, month)
})

describe('getEmptyMonthsBefore', () => {
  it('works in same year', () => {
    const output = getEmptyMonthsBefore(
      moment('2022-03-01'),
      moment('2022-09')
    )

    const expectedOutput = range(3, 9).map(toEmptyMonth(2022))

    expect(output).toEqual(expectedOutput)
  })

  it('works if data starts one year later', () => {
    const output = getEmptyMonthsBefore(
      moment('2021-03-01'),
      moment('2022-09')
    )

    const expectedOutput = [
      ...range(3, 13).map(toEmptyMonth(2021)),
      ...range(1, 9).map(toEmptyMonth(2022))
    ]

    expect(output).toEqual(expectedOutput)
  })

  it('works if data starts multiple years later', () => {
    const output = getEmptyMonthsBefore(
      moment('2020-03-01'),
      moment('2022-09')
    )

    const expectedOutput = [
      ...range(3, 13).map(toEmptyMonth(2020)),
      ...range(1, 13).map(toEmptyMonth(2021)),
      ...range(1, 9).map(toEmptyMonth(2022))
    ]

    expect(output).toEqual(expectedOutput)
  })
})

describe('getEmptyMonthsAfter', () => {
  it('works in same year', () => {
    const output = getEmptyMonthsAfter(
      moment('2022-09-01'),
      moment('2022-03')
    )

    const expectedOutput = range(4, 10).map(toEmptyMonth(2022))

    expect(output).toEqual(expectedOutput)
  })

  it('works if data starts one year later', () => {
    const output = getEmptyMonthsAfter(
      moment('2022-09-01'),
      moment('2021-03')
    )

    const expectedOutput = [
      ...range(4, 13).map(toEmptyMonth(2021)),
      ...range(1, 10).map(toEmptyMonth(2022))
    ]

    expect(output).toEqual(expectedOutput)
  })

  it('works if data starts multiple years later', () => {
    const output = getEmptyMonthsAfter(
      moment('2022-09-01'),
      moment('2020-03')
    )

    const expectedOutput = [
      ...range(4, 13).map(toEmptyMonth(2020)),
      ...range(1, 13).map(toEmptyMonth(2021)),
      ...range(1, 10).map(toEmptyMonth(2022))
    ]

    expect(output).toEqual(expectedOutput)
  })
})