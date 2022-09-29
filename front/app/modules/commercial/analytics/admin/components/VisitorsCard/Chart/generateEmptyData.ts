import { dateRange } from '../../../hooks/useVisitorsData/parse/utils';

// typings
import { Moment } from 'moment'
import { IResolution } from 'components/admin/ResolutionControl';


export const generateEmptyData = (
  startAtMoment: Moment | null | undefined,
  endAtMoment: Moment | null | undefined,
  resolution: IResolution
) => {
  
}