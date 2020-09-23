// Libraries
import React from 'react';
import { map } from 'lodash-es';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import localize, { InjectedLocalized } from 'utils/localize';
import messages from '../../messages';

// services
import {
  IUsersByDomicile,
  usersByDomicileStream,
  usersByDomicileXlsxEndpoint,
} from 'services/stats';

// components
import HorizontalBarChart from './HorizontalBarChart';
import ExportMenu from '../../components/ExportMenu';

// utils
import { isNilOrError } from 'utils/helperUtils';

interface Props {
  startAt: string | null | undefined;
  endAt: string | null;
  currentGroupFilter: string | undefined;
  currentGroupFilterLabel: string | undefined;
  className?: string;
}

const AreaChart = (props: Props & InjectedIntlProps & InjectedLocalized) => {
  const {
    intl: { formatMessage },
    localize,
  } = props;

  const areaKeyToAreaName = (
    areas: IUsersByDomicile['areas'],
    key: string
  ): string => {
    if (key === '_blank') {
      return formatMessage(messages._blank);
    } else if (key === 'outside') {
      return formatMessage(messages.outsideArea);
    } else if (areas[key]) {
      return localize(areas[key].title_multiloc);
    } else {
      return key;
    }
  };

  const convertToGraphFormat = (data: IUsersByDomicile) => {
    if (!isNilOrError(data)) {
      const {
        series: { users },
        areas,
      } = data;

      const res = map(users, (value, key) => ({
        value,
        name: areaKeyToAreaName(areas, key),
        code: key,
      }));

      return res.length > 0 ? res : null;
    }

    return null;
  };

  return (
    <HorizontalBarChart
      {...props}
      graphTitleString={formatMessage(messages.usersByDomicileTitle)}
      graphUnit="users"
      stream={usersByDomicileStream}
      convertToGraphFormat={convertToGraphFormat}
      className="dynamicHeight"
      exportMenu={
        <ExportMenu
          name={props.intl.formatMessage(messages.usersByDomicileTitle)}
          xlsxEndpoint={usersByDomicileXlsxEndpoint}
          {...props}
        />
      }
    />
  );
};

const WrappedAreaChart = injectIntl<Props>(
  localize<Props & InjectedIntlProps>(AreaChart)
);

export default WrappedAreaChart;
