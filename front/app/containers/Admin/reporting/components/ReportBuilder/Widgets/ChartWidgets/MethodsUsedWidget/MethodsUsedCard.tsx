import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { useMethodsUsed } from 'api/graph_data_units';
import { ParticipationMethod } from 'api/phases/types';

import useLayout from 'containers/Admin/reporting/hooks/useLayout';

import Statistic from 'components/admin/Graphs/Statistic';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';

import MissingData from '../../_shared/MissingData';
import { getDaysInRange } from '../utils';

import messages from './messages';
import { Props } from './typings';

const PARTICIPATION_METHODS: ParticipationMethod[] = [
  'information',
  'ideation',
  'proposals',
  'native_survey',
  'voting',
  'volunteering',
  'poll',
  'survey',
  'document_annotation',
];

const LABELS: Record<ParticipationMethod, MessageDescriptor> = {
  information: messages.information,
  ideation: messages.ideation,
  proposals: messages.proposals,
  native_survey: messages.nativeSurvey,
  community_monitor_survey: messages.nativeSurvey,
  voting: messages.voting,
  volunteering: messages.volunteering,
  poll: messages.poll,
  survey: messages.survey,
  document_annotation: messages.document_annotation,
};

const MethodsUsedCard = ({
  startAt,
  endAt,
  compareStartAt,
  compareEndAt,
}: Props) => {
  const { formatMessage } = useIntl();

  const { data, error } = useMethodsUsed({
    start_at: startAt,
    end_at: endAt,
    compare_start_at: compareStartAt,
    compare_end_at: compareEndAt,
  });

  const layout = useLayout();

  if (error) {
    return <MissingData />;
  }

  const comparedCounts = data?.data.attributes.count_per_method_compared_period;
  const previousDays = getDaysInRange(startAt, endAt);

  return (
    <Box>
      {PARTICIPATION_METHODS.map((method) => {
        const bottomLabelValue = comparedCounts?.[method];

        return (
          <Box
            key={method}
            display="inline-block"
            width={layout === 'narrow' ? '120px' : '160px'}
            mb="8px"
            mr="12px"
          >
            <Statistic
              name={formatMessage(LABELS[method])}
              value={data?.data.attributes.count_per_method[method] ?? 0}
              nameColor="black"
              bottomLabel={
                comparedCounts && previousDays
                  ? formatMessage(messages.previousXDays, {
                      days: previousDays,
                      count: bottomLabelValue ?? 0,
                    })
                  : undefined
              }
            />
          </Box>
        );
      })}
    </Box>
  );
};

export default MethodsUsedCard;
