// utils
import { map, orderBy } from 'lodash-es';
import {
  binBirthyear,
  rename,
  join,
  convertDomicileData,
  Series,
} from '../../../utils/data';
import { fallbackMessages } from '../AreaChart';

// typings
import { TCustomFieldCode } from '../../../services/userCustomFields';
import {
  IUsersByRegistrationField,
  IUsersByGender,
  IUsersByDomicile,
  IUsersByBirthyear,
} from 'modules/commercial/user_custom_fields/services/stats';

// i18n
import { InjectedIntlProps } from 'react-intl';
import messages from 'containers/Admin/dashboard/messages';
import { InjectedLocalized } from 'utils/localize';

type ISupportedDataType =
  | IUsersByRegistrationField
  | IUsersByGender
  | IUsersByDomicile
  | IUsersByBirthyear;

interface IParameters {
  formatMessage: InjectedIntlProps['intl']['formatMessage'];
  localize: InjectedLocalized['localize'];
}

type TOutput = {
  total: number;
  participants: number;
  name: string;
}[];

export type TConvertAndMergeSeries = (
  totalSerie: ISupportedDataType,
  participantSerie: ISupportedDataType,
  code: TCustomFieldCode | null
) => TOutput | null;

const GENDER_COLUMNS = ['male', 'female', 'unspecified', '_blank'];

const joinTotalAndParticipants = (total: Series, participants: Series) =>
  join(
    rename(total, { value: 'total' }),
    rename(participants, { value: 'participants' }),
    { by: 'name' }
  ) as TOutput;

const createConvertAndMergeSeries =
  ({ formatMessage, localize }: IParameters): TConvertAndMergeSeries =>
  (
    totalSerie: ISupportedDataType,
    participantSerie: ISupportedDataType,
    code: TCustomFieldCode
  ) => {
    if (code === 'birthyear') {
      const options = { missing: formatMessage(messages._blank) };

      const binnedTotal = binBirthyear(totalSerie.series.users, options);
      const binnedParticipants = binBirthyear(
        participantSerie.series.users,
        options
      );

      return joinTotalAndParticipants(binnedTotal, binnedParticipants);
    } else if (code === 'gender') {
      const res = GENDER_COLUMNS.map((gender) => ({
        total: totalSerie.series.users[gender] || 0,
        participants: participantSerie.series.users[gender] || 0,
        name: formatMessage(messages[gender]),
      }));
      return res.length > 0 ? res : null;
    } else if (code === 'domicile') {
      const parseName = (key, value) =>
        key in fallbackMessages
          ? formatMessage(fallbackMessages[key])
          : localize(value.title_multiloc);

      const areas = (totalSerie as IUsersByDomicile).areas;
      const resTotal = convertDomicileData(
        areas,
        totalSerie.series.users,
        parseName
      );
      const resParticipants = convertDomicileData(
        areas,
        participantSerie.series.users,
        parseName
      );
      const res = joinTotalAndParticipants(resTotal, resParticipants);

      const sortedByParticipants = orderBy(res, 'participants', 'desc');
      return sortedByParticipants;
    } else {
      const res = map(
        (totalSerie as IUsersByRegistrationField).options,
        (value, key) => ({
          total: totalSerie.series.users[key] || 0,
          participants: participantSerie.series.users[key] || 0,
          name: localize(value.title_multiloc),
        })
      );

      const sortedByParticipants = orderBy(res, 'participants', 'desc');
      return sortedByParticipants;
    }
  };

export default createConvertAndMergeSeries;
