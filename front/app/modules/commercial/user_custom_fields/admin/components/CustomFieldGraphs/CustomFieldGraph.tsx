import React from 'react';
import { isEmpty } from 'lodash-es';
import { Subscription, combineLatest } from 'rxjs';

// intl
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from 'containers/Admin/dashboard/messages';
import injectLocalize, { InjectedLocalized } from 'utils/localize';
import T from 'components/T';

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

// typings
import { IUserCustomFieldData } from '../../../services/userCustomFields';
import { IStream } from 'utils/streams';

// services
import {
  usersByRegFieldStream,
  usersByRegFieldXlsxEndpoint,
  usersByGenderStream,
  usersByGenderXlsxEndpoint,
  usersByBirthyearStream,
  usersByBirthyearXlsxEndpoint,
  usersByDomicileStream,
  usersByDomicileXlsxEndpoint,
} from 'modules/commercial/user_custom_fields/services/stats';

// utils
import { isNilOrError } from 'utils/helperUtils';
import createConvertAndMergeSeries, {
  TConvertAndMergeSeries,
} from './convertAndMergeSeries';

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

type Props = InputProps & InjectedIntlProps & InjectedLocalized;

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

export class CustomFieldsGraph extends React.PureComponent<Props, State> {
  combined$: Subscription;
  currentChart: React.RefObject<any>;
  convertAndMergeSeries: TConvertAndMergeSeries;

  constructor(props: Props) {
    super(props as any);
    this.state = {
      serie: null,
    };

    this.currentChart = React.createRef();

    const {
      localize,
      intl: { formatMessage },
    } = props;
    this.convertAndMergeSeries = createConvertAndMergeSeries({
      localize,
      formatMessage,
    });
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
        const { code } = customField.attributes;

        const convertedAndMergedSeries = this.convertAndMergeSeries(
          totalSerie,
          participantSerie,
          code
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

export default injectLocalize<InputProps>(
  injectIntl<InputProps & InjectedLocalized>(
    withTheme(CustomFieldsGraph as any) as any
  )
);
