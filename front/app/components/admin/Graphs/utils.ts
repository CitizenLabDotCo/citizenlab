// utils
import { isEmpty } from 'lodash-es';
import { isNilOrError, NilOrError } from 'utils/helperUtils';

export const hasNoData = (
  data: Record<string, any>[] | NilOrError
): data is NilOrError =>
  isNilOrError(data) || data.every(isEmpty) || data.length <= 0;
