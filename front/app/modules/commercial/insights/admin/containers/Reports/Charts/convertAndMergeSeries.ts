// utils
import { map, orderBy } from 'lodash-es';
import {
  binBirthyear,
  rename,
  join,
  convertDomicileData,
  Series,
} from 'utils/dataUtils';
import { fallbackMessages } from 'containers/Admin/dashboard/users/Charts/AreaChart';

// typings
import { TCustomFieldCode } from 'components/UserCustomFields/services/userCustomFields';
import {
  IUsersByRegistrationField,
  IUsersByDomicile,
  IUsersByBirthyear,
} from 'modules/commercial/user_custom_fields/services/stats';

// i18n
import messages from 'containers/Admin/dashboard/messages';
import { InjectedLocalized } from 'utils/localize';
import { MessageDescriptor } from 'react-intl';
import { FormatMessage } from 'typings';

export type ISupportedDataType =
  | IUsersByRegistrationField
  | IUsersByDomicile
  | IUsersByBirthyear;

interface IParameters {
  formatMessage: FormatMessage;
  localize: InjectedLocalized['localize'];
}

export type TOutput = {
  total: number;
  participants: number;
  name: string;
}[];

export type TConvertAndMergeSeries = (
  totalSerie: ISupportedDataType,
  participantSerie: ISupportedDataType,
  code: TCustomFieldCode | null
) => TOutput;

type Gender = 'male' | 'female' | 'unspecified' | '_blank';

const GENDER_COLUMNS: Gender[] = ['male', 'female', 'unspecified', '_blank'];

const GENDER_MESSAGES: Record<Gender, MessageDescriptor> = {
  male: messages.male,
  female: messages.female,
  unspecified: messages.unspecified,
  _blank: messages._blank,
};

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
      const options = { missingBin: formatMessage(messages._blank) };

      const binnedTotal = binBirthyear(totalSerie.series.users, options);
      const binnedParticipants = binBirthyear(
        participantSerie.series.users,
        options
      );

      return joinTotalAndParticipants(binnedTotal, binnedParticipants);
    }

    if (code === 'gender') {
      return GENDER_COLUMNS.map((gender) => ({
        total: totalSerie.series.users[gender] || 0,
        participants: participantSerie.series.users[gender] || 0,
        name: formatMessage(GENDER_MESSAGES[gender]),
      }));
    }

    if (code === 'domicile') {
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

      return orderBy(res, 'participants', 'desc');
    }

    const res = map(
      (totalSerie as IUsersByRegistrationField).options,
      (value, key) => ({
        total: totalSerie.series.users[key] || 0,
        participants: participantSerie.series.users[key] || 0,
        name: localize(value.title_multiloc),
      })
    );

    return orderBy(res, 'participants', 'desc');
  };

export default createConvertAndMergeSeries;
