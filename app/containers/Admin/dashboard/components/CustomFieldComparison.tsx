// libraries
import React from 'react';
import { isEmpty, map } from 'lodash-es';

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
  IGraphUnit,
  NoDataContainer,
  GraphCardHeader,
  GraphCardTitle,
  GraphCard,
  GraphCardInner,
} from '..';

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

type ISupportedDataType =
  | IUsersByRegistrationField
  | IUsersByGender
  | IUsersByDomicile
  | IUsersByBirthyear;

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
      return [];
    } else if (customField.attributes.code === 'gender') {
      return [];
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
        name: formatMessage(messages.outsideArea),
        code: 'outside',
      });

      return res;
    } else {
      console.log(totalSerie, participantSerie);
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
      customFieldEndpoints[customField.attributes.key]?.stream ||
      usersByRegFieldStream;

    const totalUsersStream = stream(null, customField.id);
    const participantsStream = stream(
      { queryParameters: { project: currentProject } },
      customField.id
    );
    console.log(stream, totalUsersStream, participantsStream);
    this.combined$ = combineLatest(
      totalUsersStream.observable,
      participantsStream.observable
    ).subscribe(([totalSerie, participantSerie]) => {
      console.log(participantSerie, 'participantSerie');
      console.log(totalSerie, 'totalSerie');

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
    const { className, customField } = this.props;

    const noData =
      !serie || serie.every((item) => isEmpty(item)) || serie.length <= 0;

    console.log(serie, customField);

    return (
      <GraphCard className={className}>
        <GraphCardInner>
          <GraphCardHeader>
            <GraphCardTitle>title</GraphCardTitle>
            {!noData && (
              <ExportMenu
                name={'title'}
                svgNode={this.currentChart}
                xlsxEndpoint={usersByRegFieldXlsxEndpoint(customField.id)}
              />
            )}
          </GraphCardHeader>
          {noData ? (
            <NoDataContainer>
              <FormattedMessage {...messages.noData} />
            </NoDataContainer>
          ) : (
            <ResponsiveContainer>
              <span>"hehehehe"</span>
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
