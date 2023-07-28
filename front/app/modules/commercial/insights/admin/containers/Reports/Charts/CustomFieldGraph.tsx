import React, { useRef } from 'react';
import { isEmpty } from 'lodash-es';

// intl
import { injectIntl } from 'utils/cl-intl';
import { WrappedComponentProps } from 'react-intl';
import messages from 'containers/Admin/dashboard/messages';
import injectLocalize, { InjectedLocalized } from 'utils/localize';
import T from 'components/T';

// styling
import {
  sizes,
  DEFAULT_BAR_CHART_MARGIN,
} from 'components/admin/Graphs/styling';

// components
import ReportExportMenu from 'components/admin/ReportExportMenu';
import {
  GraphCardHeader,
  GraphCardTitle,
  GraphCard,
  GraphCardInner,
} from 'components/admin/GraphWrappers';
import { Tooltip } from 'recharts';
import BarChart from 'components/admin/Graphs/BarChart';
import { Box, colors } from '@citizenlab/cl2-component-library';

// typings
import { IUserCustomFieldData } from 'api/user_custom_fields/types';

// utils
import { isNilOrError } from 'utils/helperUtils';
import createConvertAndMergeSeries, {
  ISupportedDataType,
  TOutput,
} from './convertAndMergeSeries';
import useUsersByGender from 'api/users_by_gender/useUsersByGender';
import useUsersByBirthyear from 'api/users_by_birthyear/useUsersByBirthyear';
import { usersByGenderXlsxEndpoint } from 'api/users_by_gender/util';
import { usersByBirthyearXlsxEndpoint } from 'api/users_by_birthyear/util';
import { usersByDomicileXlsxEndpoint } from 'api/users_by_domicile/util';
import useUsersByDomicile from 'api/users_by_domicile/useUsersByDomicile';
import { usersByCustomFieldXlsxEndpoint } from 'api/users_by_custom_field/util';

interface ICustomFieldEndpoint {
  xlsxEndpoint: string;
}

type TAllowedCode = 'gender' | 'birthyear' | 'domicile';

const customFieldEndpoints: Record<TAllowedCode, ICustomFieldEndpoint> = {
  gender: {
    xlsxEndpoint: usersByGenderXlsxEndpoint,
  },
  birthyear: {
    xlsxEndpoint: usersByBirthyearXlsxEndpoint,
  },
  domicile: {
    xlsxEndpoint: usersByDomicileXlsxEndpoint,
  },
};

interface InputProps {
  startAt: string;
  endAt: string;
  customField: IUserCustomFieldData;
  currentProject: string | undefined;
  className?: string;
}

type Props = InputProps & WrappedComponentProps & InjectedLocalized;

interface TooltipProps {
  payload?: { name?: string; value?: string; payload?: { total: number } }[];
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
  if (active && payload && payload[0]) {
    return (
      <Box bgColor="#fff" border="1px solid #cccccc" p="10px">
        <h4 style={{ fontWeight: 600 }}>{label}</h4>
        <div>{`${payload[0].name} : ${payload[0].value}`}</div>
        <Box
          color={colors.textSecondary}
        >{`${totalLabel} : ${payload[0]?.payload?.total}`}</Box>
      </Box>
    );
  }

  return null;
};

const CustomFieldsGraph = ({
  startAt,
  endAt,
  customField,
  currentProject,
  localize,
  intl: { formatMessage },
  className,
}: Props) => {
  const { code } = customField.attributes;

  const { data: usersByGenderWithFilters } = useUsersByGender({
    start_at: startAt,
    end_at: endAt,
    project: currentProject,
    filter_by_participation: true,
    enabled: code === 'gender',
  });
  const { data: usersByGenderWithoutFilters } = useUsersByGender({
    enabled: code === 'gender',
  });

  const { data: usersByBirthyearWithFilters } = useUsersByBirthyear({
    start_at: startAt,
    end_at: endAt,
    project: currentProject,
    filter_by_participation: true,
    enabled: code === 'birthyear',
  });
  const { data: usersByBirthyearWithoutFilters } = useUsersByBirthyear({
    enabled: code === 'birthyear',
  });

  const { data: usersByDomicileWithFilters } = useUsersByDomicile({
    start_at: startAt,
    end_at: endAt,
    project: currentProject,
    filter_by_participation: true,
    enabled: code === 'domicile',
  });
  const { data: usersByDomicileWithoutFilters } = useUsersByDomicile({
    enabled: code === 'domicile',
  });

  const currentChartRef = useRef();
  const convertAndMergeSeriesRef = useRef(
    createConvertAndMergeSeries({
      localize,
      formatMessage,
    })
  );
  const convertAndMergeSeries = convertAndMergeSeriesRef.current;

  const serieMap: Record<
    TAllowedCode,
    {
      totalSeries: ISupportedDataType | undefined;
      participantSeries: ISupportedDataType | undefined;
    }
  > = {
    domicile: {
      totalSeries: usersByDomicileWithoutFilters,
      participantSeries: usersByDomicileWithFilters,
    },
    birthyear: {
      totalSeries: usersByBirthyearWithoutFilters,
      participantSeries: usersByBirthyearWithFilters,
    },
    gender: {
      totalSeries: usersByGenderWithoutFilters,
      participantSeries: usersByGenderWithFilters,
    },
  };

  const totalSerie = code && serieMap[code]?.totalSeries;

  const participantSerie = code && serieMap[code]?.participantSeries;

  const serie: TOutput | undefined =
    code &&
    totalSerie &&
    participantSerie &&
    convertAndMergeSeries(totalSerie, participantSerie, code);

  const noData =
    isNilOrError(serie) ||
    serie.every((item) => isEmpty(item)) ||
    serie.length <= 0;

  const xlsxEndpoint =
    code && code in customFieldEndpoints
      ? customFieldEndpoints[code as TAllowedCode].xlsxEndpoint
      : usersByCustomFieldXlsxEndpoint(customField.id);

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
              svgNode={currentChartRef}
              xlsx={{ endpoint: xlsxEndpoint }}
              currentProjectFilter={currentProject}
              startAt={startAt}
              endAt={endAt}
            />
          )}
        </GraphCardHeader>
        <BarChart
          height={serie && serie.length > 1 ? serie.length * 50 : 100}
          data={serie}
          mapping={{
            category: 'name',
            length: 'participants',
          }}
          bars={{ name: formatMessage(messages.participants), size: sizes.bar }}
          layout="horizontal"
          innerRef={currentChartRef}
          margin={{
            ...DEFAULT_BAR_CHART_MARGIN,
            left: 20,
          }}
          yaxis={{ width: 150, tickLine: false }}
          labels
          tooltip={() => (
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
        />
      </GraphCardInner>
    </GraphCard>
  );
};

export default injectLocalize<InputProps>(injectIntl(CustomFieldsGraph));
