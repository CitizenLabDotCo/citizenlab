// utils
import { map, orderBy } from 'lodash-es';
import { rename, join, Series, binBirthyear } from 'utils/dataUtils';

// typings
import { TCustomFieldCode } from 'api/user_custom_fields/types';
import { IUsersByDomicile } from 'services/userCustomFieldStats';

// i18n
import messages from 'containers/Admin/dashboard/messages';
import { InjectedLocalized } from 'utils/localize';
import { MessageDescriptor } from 'react-intl';
import { FormatMessage } from 'typings';
import { IUsersByRegistrationField } from 'api/users_by_gender/types';
import { IUsersByBirthyear } from 'api/users_by_birthyear/types';

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
    const totalUsers = totalSerie.data.attributes.series.users;
    const participantUsers = participantSerie.data.attributes.series.users;

    if (code === 'birthyear') {
      const options = { missingBin: formatMessage(messages._blank) };

      const binnedTotal = binBirthyear(totalUsers, options);
      const binnedParticipants = binBirthyear(participantUsers, options);

      return joinTotalAndParticipants(binnedTotal, binnedParticipants);
    }

    if (code === 'gender') {
      return GENDER_COLUMNS.map((gender) => ({
        total: totalUsers[gender] || 0,
        participants: participantUsers[gender] || 0,
        name: formatMessage(GENDER_MESSAGES[gender]),
      }));
    }

    // if (code === 'domicile') {
    //   const parseName = (key, value) =>
    //     key in fallbackMessages
    //       ? formatMessage(fallbackMessages[key])
    //       : localize(value.title_multiloc);

    //   const areas = (totalSerie as IUsersByDomicile).data.attributes.areas;
    //   const resTotal = convertDomicileData(areas, totalUsers, parseName);

    //   const resParticipants = convertDomicileData(
    //     areas,
    //     participantUsers,
    //     parseName
    //   );

    //   const res = joinTotalAndParticipants(resTotal, resParticipants);

    //   return orderBy(res, 'participants', 'desc');
    // }

    const res = map(
      (totalSerie as IUsersByRegistrationField).data.attributes.options,
      (value, key) => ({
        total: totalUsers[key] || 0,
        participants: participantUsers[key] || 0,
        name: localize(value.title_multiloc),
      })
    );

    return orderBy(res, 'participants', 'desc');
  };

export default createConvertAndMergeSeries;
