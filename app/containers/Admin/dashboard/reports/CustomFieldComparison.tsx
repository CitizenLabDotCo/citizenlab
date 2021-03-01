// libraries
import React from 'react';
import { isEmpty, map, range, forOwn, get } from 'lodash-es';

// intl
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../messages';

// styling
import { withTheme } from 'styled-components';

// components
import ExportMenu from '../components/ExportMenu';
import {
  BarChart,
  Bar,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from 'recharts';
import {
  NoDataContainer,
  GraphCardHeader,
  GraphCardTitle,
  GraphCard,
  GraphCardInner,
} from '..';

import { IUserCustomFieldData } from 'services/userCustomFields';
import { Subscription, combineLatest } from 'rxjs';
import {
  IUsersByRegistrationField,
  usersByRegFieldStream,
  usersByRegFieldXlsxEndpoint,
  usersByGenderStream,
  usersByGenderXlsxEndpoint,
  usersByBirthyearStream,
  usersByBirthyearXlsxEndpoint,
  usersByDomicileStream,
  usersByDomicileXlsxEndpoint,
  IUsersByGender,
  IUsersByDomicile,
  IUsersByBirthyear,
} from 'services/stats';
import injectLocalize, { InjectedLocalized } from 'utils/localize';
import { isNilOrError } from 'utils/helperUtils';
import moment from 'moment';
import T from 'components/T';

type ISupportedDataType =
  | IUsersByRegistrationField
  | IUsersByGender
  | IUsersByDomicile
  | IUsersByBirthyear;

const genderColors = {
  male: '#5D99C6 ',
  female: '#C37281 ',
  unspecified: '#B0CDC4 ',
  _blank: '#C0C2CE',
};

const customFieldEndpoints = {
  gender: {
    stream: usersByGenderStream,
    xlsxEndpoint: usersByGenderXlsxEndpoint,
  },
  birthyear: {
    stream: usersByBirthyearStream,
    xlsxEndpoint: usersByBirthyearXlsxEndpoint,
  },
  domicile: {
    stream: usersByDomicileStream,
    xlsxEndpoint: usersByDomicileXlsxEndpoint,
  },
};

interface InputProps {
  customField: IUserCustomFieldData;
  currentProject: string | undefined;
  className?: string;
}

interface State {
  serie: any;
}

interface Props extends InputProps {}

export class CustomFieldsComparison extends React.PureComponent<
  Props & InjectedIntlProps & InjectedLocalized,
  State
> {
  combined$: Subscription;
  currentChart: React.RefObject<any>;

  constructor(props: Props) {
    super(props as any);
    this.state = {
      serie: null,
    };

    this.currentChart = React.createRef();
  }

  componentDidMount() {
    this.resubscribe();
  }

  componentDidUpdate(prevProps: Props) {
    const { currentProject } = this.props;

    if (currentProject !== prevProps.currentProject) {
      this.resubscribe();
    }
  }

  componentWillUnmount() {
    this.combined$.unsubscribe();
  }

  convertAndMergeSeries = (
    totalSerie: ISupportedDataType,
    participantSerie: ISupportedDataType
  ) => {
    const {
      customField,
      intl: { formatMessage },
      localize,
    } = this.props;

    if (customField.attributes.code === 'birthyear') {
      const currentYear = moment().year();

      return [
        ...range(0, 100, 10).map((minAge) => {
          let totalNumberOfUsers = 0;
          let paticipants = 0;
          const maxAge = minAge + 9;

          forOwn(totalSerie.series.users, (userCount, birthYear) => {
            const age = currentYear - parseInt(birthYear, 10);

            if (age >= minAge && age <= maxAge) {
              totalNumberOfUsers += userCount;
            }
          });

          forOwn(participantSerie.series.users, (userCount, birthYear) => {
            const age = currentYear - parseInt(birthYear, 10);

            if (age >= minAge && age <= maxAge) {
              paticipants += userCount;
            }
          });

          return {
            name: `${minAge} - ${maxAge}`,
            total: totalNumberOfUsers,
            participants: paticipants,
            code: `${minAge}`,
          };
        }),
        {
          name: formatMessage(messages._blank),
          total: get(totalSerie.series.users, '_blank', 0),
          participants: get(participantSerie.series.users, '_blank', 0),
          code: '',
        },
      ];
    } else if (customField.attributes.code === 'gender') {
      const res = Object.keys(genderColors).map((gender) => ({
        total: totalSerie.series.users[gender] || 0,
        participants: participantSerie.series.users[gender] || 0,
        name: formatMessage(messages[gender]),
        code: gender,
      }));
      return res.length > 0 ? res : null;
    } else if (customField.attributes.code === 'domicile') {
      const res = map((totalSerie as IUsersByDomicile).areas, (value, key) => ({
        total: totalSerie.series.users[key] || 0,
        participants: participantSerie.series.users[key] || 0,
        name: localize(value.title_multiloc),
        code: key,
      }));

      res.push({
        total: totalSerie.series.users['_blank'] || 0,
        participants: participantSerie.series.users['_blank'] || 0,
        name: formatMessage(messages._blank),
        code: '_blank',
      });
      res.push({
        total: totalSerie.series.users['outside'] || 0,
        participants: participantSerie.series.users['outside'] || 0,
        name: formatMessage(messages.otherArea),
        code: 'outside',
      });

      return res;
    } else {
      return map(
        (totalSerie as IUsersByRegistrationField).options,
        (value, key) => ({
          total: totalSerie.series.users[key] || 0,
          participants: participantSerie.series.users[key] || 0,
          name: localize(value.title_multiloc),
          code: key,
        })
      );
    }
  };

  resubscribe() {
    const { customField, currentProject } = this.props;

    if (this.combined$) {
      this.combined$.unsubscribe();
    }
    const stream =
      customFieldEndpoints[customField.attributes?.code || 'no_code']?.stream ||
      usersByRegFieldStream;

    const totalUsersStream = stream(null, customField.id);
    const participantsStream = stream(
      { queryParameters: { project: currentProject } },
      customField.id
    );
    this.combined$ = combineLatest(
      totalUsersStream.observable,
      participantsStream.observable
    ).subscribe(([totalSerie, participantSerie]) => {
      if (!isNilOrError(totalSerie) && !isNilOrError(participantSerie)) {
        const convertedAndMergedSeries = this.convertAndMergeSeries(
          totalSerie as ISupportedDataType,
          participantSerie as ISupportedDataType
        );
        this.setState({ serie: convertedAndMergedSeries });
      }
    });
  }
  render() {
    const { serie } = this.state;
    const {
      className,
      customField,
      intl: { formatMessage },
      localize,
      currentProject,
    } = this.props;

    const noData =
      !serie || serie.every((item) => isEmpty(item)) || serie.length <= 0;

    const {
      chartLabelSize,
      chartLabelColor,
      barFill,
      animationBegin,
      animationDuration,
      newBarFill,
    } = this.props['theme'];

    const xlsxEndpoint =
      customFieldEndpoints[customField.attributes.code || 'no_code']
        ?.xlsxEndpoint || usersByRegFieldXlsxEndpoint(customField.id);

    return (
      <GraphCard className={`dynamicHeight ${className}`}>
        <GraphCardInner>
          <GraphCardHeader>
            <GraphCardTitle>
              <T value={customField.attributes.title_multiloc} />
            </GraphCardTitle>
            {!noData && (
              <ExportMenu
                name={formatMessage(messages.customFieldTitleExport, {
                  fieldName: localize(customField.attributes.title_multiloc),
                })}
                svgNode={this.currentChart}
                xlsxEndpoint={xlsxEndpoint}
                currentProjectFilter={currentProject}
              />
            )}
          </GraphCardHeader>
          {noData ? (
            <NoDataContainer>
              <FormattedMessage {...messages.noData} />
            </NoDataContainer>
          ) : (
            <ResponsiveContainer
              height={serie.length > 1 ? serie.length * 50 : 100}
            >
              <BarChart
                data={serie}
                layout="vertical"
                ref={this.currentChart}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <Bar
                  dataKey="total"
                  name={formatMessage(messages.totalUsers)}
                  fill={newBarFill}
                  label={{
                    fill: barFill,
                    fontSize: chartLabelSize,
                    position: 'insideLeft',
                  }}
                  barSize={10}
                  animationDuration={animationDuration}
                  animationBegin={animationBegin}
                />
                <Tooltip />
                <Bar
                  dataKey="participants"
                  name={formatMessage(messages.participants)}
                  fill={chartLabelColor}
                  label={{
                    fill: barFill,
                    fontSize: chartLabelSize,
                    position: 'insideLeft',
                  }}
                  barSize={10}
                  animationDuration={animationDuration}
                  animationBegin={animationBegin}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={150}
                  stroke={chartLabelColor}
                  fontSize={chartLabelSize}
                  tickLine={false}
                />
                <XAxis
                  stroke={chartLabelColor}
                  fontSize={chartLabelSize}
                  type="number"
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </GraphCardInner>
      </GraphCard>
    );
  }
}

export default injectLocalize<Props>(
  injectIntl<Props & InjectedLocalized>(
    withTheme(CustomFieldsComparison as any) as any
  )
);
