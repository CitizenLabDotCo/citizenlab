import React, { useMemo } from 'react';

import {
  Box,
  Image,
  Input,
  Text,
  Tooltip,
} from '@citizenlab/cl2-component-library';
import { debounce } from 'lodash-es';

import NumberField from 'design-system/NumberField';
import TooltipMark from 'design-system/Tooltip/TooltipMark';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useIdeaById from 'api/ideas/useIdeaById';
import useUpdateIdea from 'api/ideas/useUpdateIdea';
import useAuthUser from 'api/me/useAuthUser';
import { VotingMethod } from 'api/phases/types';
import usePhase from 'api/phases/usePhase';
import useUpdatePhase from 'api/phases/useUpdatePhase';
import useUserById from 'api/users/useUserById';

import { trackEventByName } from 'utils/analytics';
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { getFullName } from 'utils/textUtils';

import messages from '../messages';
import tracks from '../tracks';

import tooltipPreview from './assets/preview_for_tooltip.png';
import styles from './OfflineVoteSettings.module.css';
import 'design-system/tokens.css';

interface Props {
  ideaId: string;
  phaseId: string;
  votingMethod: VotingMethod;
  variant?: 'default' | 'panel';
}

const OfflineVoteSettings = ({
  ideaId,
  votingMethod,
  phaseId,
  variant = 'default',
}: Props) => {
  const { formatMessage } = useIntl();
  const { data: authUser } = useAuthUser();

  const { data: appConfig } = useAppConfiguration();
  const { data: phase } = usePhase(phaseId);
  const tenantId = appConfig?.data.id;
  const { data: idea } = useIdeaById(ideaId);
  const { data: userLastModifiedVotes } = useUserById(
    idea?.data.relationships.manual_votes_last_updated_by?.data?.id
  );
  const { data: userLastModifiedVoters } = useUserById(
    phase?.data.relationships.manual_voters_last_updated_by?.data?.id
  );
  const { mutate: updateIdea } = useUpdateIdea();
  const { mutate: updatePhase } = useUpdatePhase();
  const [manualVotesAmount, setManualVotesAmount] = React.useState<
    number | null
  >(idea?.data.attributes.manual_votes_amount || null);
  const [manualVotersAmount, setManualVotersAmount] = React.useState<
    number | null
  >(phase?.data.attributes.manual_voters_amount || null);
  const isBudgeting = votingMethod === 'budgeting';

  const handleOfflineVotesChangedDebounced = useMemo(() => {
    return debounce((amount: number | null) => {
      updateIdea({
        id: ideaId,
        requestBody: { manual_votes_amount: amount },
        skipRefetchCounts: true,
      });

      trackEventByName(tracks.changeManualVoteAmount, {
        tenant: tenantId,
        location: 'Manual vote input',
        idea: ideaId,
        phase: phaseId,
        currentUser: authUser?.data.id || null,
      });
    }, 300);
  }, [authUser?.data.id, ideaId, phaseId, tenantId, updateIdea]);

  const handleOfflineVotersChangedDebounced = useMemo(() => {
    return debounce((amount: number | null) => {
      amount !== null &&
        updatePhase({
          phaseId,
          manual_voters_amount: amount,
        });

      trackEventByName(tracks.changeManualVoterAmount, {
        tenant: tenantId,
        location: 'Manual voters input',
        phase: phaseId,
        currentUser: authUser?.data.id || null,
      });
    }, 300);
  }, [authUser?.data.id, phaseId, tenantId, updatePhase]);

  if (variant === 'panel') {
    const votersModifiedBy = userLastModifiedVoters?.data.attributes
      .first_name && (
      <FormattedMessage
        {...messages.modifiedBy}
        values={{
          name: `${userLastModifiedVoters.data.attributes.first_name} ${userLastModifiedVoters.data.attributes.last_name}`,
        }}
      />
    );
    const votesModifiedBy = userLastModifiedVotes?.data.attributes
      .first_name && (
      <FormattedMessage
        {...messages.modifiedBy}
        values={{ name: getFullName(userLastModifiedVotes.data) }}
      />
    );
    const votesDisabled = !manualVotersAmount && isBudgeting;
    const votesLabel = formatMessage(
      isBudgeting
        ? messages.manualPickAdjustment
        : messages.manualVoteAdjustment
    );
    // NumberField reports NaN when the field is cleared.
    const toAmount = (value: number) => (Number.isNaN(value) ? null : value);

    return (
      <div className={styles.panel}>
        {isBudgeting && (
          <div className={styles.field}>
            <NumberField
              label={formatMessage(messages.manualVotersLabel)}
              labelAccessory={
                <TooltipMark
                  content={
                    <>
                      <FormattedMessage
                        {...messages.manualVotersTooltip1}
                        values={{ b: (chunks) => <strong>{chunks}</strong> }}
                      />
                      <span className={styles.tooltipBlock}>
                        <FormattedMessage {...messages.manualVotersTooltip2} />
                      </span>
                    </>
                  }
                />
              }
              value={manualVotersAmount ?? undefined}
              // NumberField commits its value on blur, Enter and the steppers.
              onChange={(value) => {
                const amount = toAmount(value);
                setManualVotersAmount(amount);
                handleOfflineVotersChangedDebounced(amount);
              }}
            />
            {votersModifiedBy && (
              <p className={styles.modifiedBy}>{votersModifiedBy}</p>
            )}
          </div>
        )}
        <div className={styles.field}>
          <NumberField
            label={votesLabel}
            labelAccessory={
              <TooltipMark
                content={
                  <>
                    <img
                      className={styles.tooltipImage}
                      src={tooltipPreview}
                      alt="info"
                    />
                    <FormattedMessage
                      {...messages.manualVoteAdjustmentTooltip1}
                    />
                    <ul className={styles.tooltipList}>
                      <li>
                        <FormattedMessage
                          {...messages.manualVoteAdjustmentTooltip2}
                        />
                      </li>
                      <li>
                        <FormattedMessage
                          {...messages.manualVoteAdjustmentTooltip3}
                        />
                      </li>
                      <li>
                        <FormattedMessage
                          {...messages.manualVoteAdjustmentTooltip4}
                        />
                      </li>
                      <li>
                        <FormattedMessage
                          {...messages.manualVoteAdjustmentTooltip5}
                        />
                      </li>
                    </ul>
                  </>
                }
              />
            }
            value={manualVotesAmount ?? undefined}
            isDisabled={votesDisabled}
            description={
              votesDisabled
                ? formatMessage(messages.manualVotersDisabledTooltip)
                : undefined
            }
            onChange={(value) => {
              const amount = toAmount(value);
              setManualVotesAmount(amount);
              handleOfflineVotesChangedDebounced(amount);
            }}
          />
          {votesModifiedBy && (
            <p className={styles.modifiedBy}>{votesModifiedBy}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <Box mt="20px">
      {votingMethod === 'budgeting' && (
        <Box mb="20px">
          <Input
            type="number"
            value={manualVotersAmount?.toString() || ''}
            label={<FormattedMessage {...messages.manualVotersLabel} />}
            labelTooltipText={
              <Box>
                <FormattedMessage
                  {...messages.manualVotersTooltip1}
                  values={{
                    b: (chunks) => (
                      <strong style={{ fontWeight: 'bold' }}>{chunks}</strong>
                    ),
                  }}
                />{' '}
                <Box mt="12px">
                  <FormattedMessage {...messages.manualVotersTooltip2} />
                </Box>
              </Box>
            }
            onChange={(value) => {
              setManualVotersAmount(parseInt(value, 10));
            }}
            onBlur={() => {
              handleOfflineVotersChangedDebounced(manualVotersAmount);
            }}
          />
          {userLastModifiedVoters?.data.attributes.first_name && (
            <Text pt="4px" m="0px" color="textSecondary" fontSize="s">
              <FormattedMessage
                {...messages.modifiedBy}
                values={{
                  name: `${userLastModifiedVoters.data.attributes.first_name} ${userLastModifiedVoters.data.attributes.last_name}`,
                }}
              />
            </Text>
          )}
        </Box>
      )}
      <Tooltip
        disabled={!!manualVotersAmount || !isBudgeting}
        content={<FormattedMessage {...messages.manualVotersDisabledTooltip} />}
      >
        <>
          <Input
            type="number"
            value={manualVotesAmount?.toString() || ''}
            disabled={!manualVotersAmount && isBudgeting}
            labelTooltipText={
              <Box>
                <Box mb="12px">
                  <Image src={tooltipPreview} alt="info" />
                </Box>
                <FormattedMessage {...messages.manualVoteAdjustmentTooltip1} />
                <li>
                  <FormattedMessage
                    {...messages.manualVoteAdjustmentTooltip2}
                  />
                </li>
                <li>
                  <FormattedMessage
                    {...messages.manualVoteAdjustmentTooltip3}
                  />
                </li>
                <li>
                  <FormattedMessage
                    {...messages.manualVoteAdjustmentTooltip4}
                  />
                </li>
                <li>
                  <FormattedMessage
                    {...messages.manualVoteAdjustmentTooltip5}
                  />
                </li>
              </Box>
            }
            label={
              <Box display="flex" gap="4px">
                {votingMethod === 'budgeting' ? (
                  <FormattedMessage {...messages.manualPickAdjustment} />
                ) : (
                  <FormattedMessage {...messages.manualVoteAdjustment} />
                )}
              </Box>
            }
            onChange={(value) => {
              setManualVotesAmount(parseInt(value, 10));
            }}
            onBlur={() => {
              handleOfflineVotesChangedDebounced(manualVotesAmount);
            }}
          />
          {userLastModifiedVotes?.data.attributes.first_name && (
            <Text pt="4px" m="0px" color="textSecondary" fontSize="s">
              <FormattedMessage
                {...messages.modifiedBy}
                values={{
                  name: getFullName(userLastModifiedVotes.data),
                }}
              />
            </Text>
          )}
        </>
      </Tooltip>
    </Box>
  );
};

export default OfflineVoteSettings;
