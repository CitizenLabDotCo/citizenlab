// libraries
import React from 'react';
import { isEmpty, map, range, forOwn, get, orderBy } from 'lodash-es';

// intl
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from 'containers/Admin/dashboard/messages';

// styling
import { withTheme } from 'styled-components';

// components
import ReportExportMenu from 'components/admin/ReportExportMenu';
import {
  GraphCardHeader,
  GraphCardTitle,
  GraphCard,
  GraphCardInner,
} from 'components/admin/GraphWrappers';
import { Tooltip, LabelList } from 'recharts';
import BarChart, { DEFAULT_MARGIN } from 'components/admin/Graphs/BarChart';
import { Box, colors } from '@citizenlab/cl2-component-library';

import { IUserCustomFieldData } from '../../services/userCustomFields';
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
} from 'modules/commercial/user_custom_fields/services/stats';

import injectLocalize, { InjectedLocalized } from 'utils/localize';
import { isNilOrError } from 'utils/helperUtils';
import moment from 'moment';
import T from 'components/T';
import useUserCustomFields from '../../hooks/useUserCustomFields';
import { IStream } from 'utils/streams';

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

interface Props {
  customField: IUserCustomFieldData;
  currentProject: string | undefined;
  className?: string;
}

interface State {
  serie: any;
}

interface TooltipProps {
  payload: { name?: string; value?: string; payload?: { total: number } }[];
  label?: string;
  active?: boolean;
  totalLabel: string;
}

const CustomTooltip = ({
  payload,
  label,
  active,
  totalLabel,
}: TooltipProps) => {
  if (active) {
    return (
      <Box bgColor="#fff" border="1px solid #cccccc" p="10px">
        <h4 style={{ fontWeight: 600 }}>{label}</h4>
        <div>{`${payload[0].name} : ${payload[0].value}`}</div>
        <Box
          color={colors.label}
        >{`${totalLabel} : ${payload[0]?.payload?.total}`}</Box>
      </Box>
    );
  }

  return null;
};

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

      const sortedByParticipants = orderBy(res, 'participants', 'desc');
      return sortedByParticipants;
    } else {
      const res = map(
        (totalSerie as IUsersByRegistrationField).options,
        (value, key) => ({
          total: totalSerie.series.users[key] || 0,
          participants: participantSerie.series.users[key] || 0,
          name: localize(value.title_multiloc),
          code: key,
        })
      );

      const sortedByParticipants = orderBy(res, 'participants', 'desc');
      return sortedByParticipants;
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

    const totalUsersStream: IStream<any> = stream(null, customField.id);
    const participantsStream: IStream<any> = stream(
      { queryParameters: { project: currentProject } },
      customField.id
    );
    this.combined$ = combineLatest([
      totalUsersStream.observable,
      participantsStream.observable,
    ]).subscribe(([totalSerie, participantSerie]) => {
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

    const { barSize } = this.props['theme'];

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
              <ReportExportMenu
                name={formatMessage(messages.customFieldTitleExport, {
                  fieldName: localize(customField.attributes.title_multiloc),
                })}
                svgNode={this.currentChart}
                xlsxEndpoint={xlsxEndpoint}
                currentProjectFilter={currentProject}
              />
            )}
          </GraphCardHeader>
          <BarChart
            height={serie && serie.length > 1 ? serie.length * 50 : 100}
            data={serie}
            layout="horizontal"
            innerRef={this.currentChart}
            margin={{
              ...DEFAULT_MARGIN,
              left: 20,
            }}
            bars={{ name: formatMessage(messages.participants), size: barSize }}
            mapping={{ length: 'participants' }}
            yaxis={{ width: 150, tickLine: false }}
            renderTooltip={() => (
              <>
                <Tooltip
                  content={({ active, payload, label }: TooltipProps) => (
                    <CustomTooltip
                      label={label}
                      active={active}
                      payload={payload}
                      totalLabel={formatMessage(messages.totalUsers)}
                    />
                  )}
                />
              </>
            )}
            renderLabels={(props) => <LabelList {...props} position="right" />}
          />
        </GraphCardInner>
      </GraphCard>
    );
  }
}

const WrappedCustomFieldComparison = injectLocalize<Props>(
  injectIntl<Props & InjectedLocalized>(
    withTheme(CustomFieldsComparison as any) as any
  )
);

const CustomFieldGraphs = ({
  participationMethods,
  startAt,
  endAt,
  project,
}) => {
  const userCustomFields = useUserCustomFields({
    inputTypes: ['select', 'multiselect', 'checkbox', 'number'],
  });

  return (
    participationMethods !== ['information'] &&
    startAt &&
    endAt &&
    !isNilOrError(userCustomFields) &&
    userCustomFields.map(
      (customField) =>
        // only show enabled fields, only supported number field is birthyear.
        customField.attributes.enabled &&
        (customField.attributes.input_type === 'number'
          ? customField.attributes.code === 'birthyear'
          : true) && (
          <WrappedCustomFieldComparison
            customField={customField}
            currentProject={project.id}
            key={customField.id}
          />
        )
    )
  );
};

export default CustomFieldGraphs;
