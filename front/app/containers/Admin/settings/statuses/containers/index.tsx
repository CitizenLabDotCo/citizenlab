import React from 'react';

import { Spinner, Tooltip } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { IIdeaStatusData } from 'api/idea_statuses/types';
import useIdeaStatuses from 'api/idea_statuses/useIdeaStatuses';
import useReorderIdeaStatus from 'api/idea_statuses/useReorderIdeaStatus';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { ButtonWrapper } from 'components/admin/PageWrapper';
import {
  LockedRow,
  SortableList,
  SortableRow,
  TextCell,
} from 'components/admin/ResourceList';
import {
  Section,
  SectionTitle,
  SectionDescription,
} from 'components/admin/Section';
import T from 'components/T';
import Button from 'components/UI/Button';
import Warning from 'components/UI/Warning';

import { FormattedMessage } from 'utils/cl-intl';

import DeleteStatusButton from '../components/DeleteStatusButton';
import EditStatusButton from '../components/EditStatusButton';

import messages from './messages';

const Buttons = styled.div`
  display: flex;
  align-items: center;
`;

const ColorLabel = styled.span`
  width: 24px;
  height: 24px;
  background-color: ${(props) => props.color};
  margin-right: 16px;
  border-radius: 3px;
  display: inline-block;
`;

const FlexTextCell = styled(TextCell)`
  display: flex;
  align-items: center;
`;

const IdeaStatuses = ({ variant }: { variant: 'ideation' | 'proposals' }) => {
  const { data: ideaStatuses, isLoading } = useIdeaStatuses({
    participation_method: variant,
  });
  const { mutate: reorderIdeaStatus } = useReorderIdeaStatus();
  const customIdeaStatusesAllowed = useFeatureFlag({
    name: 'custom_idea_statuses',
    onlyCheckAllowed: true,
  });

  const handleReorder = (id: string, ordering: number) => {
    reorderIdeaStatus({
      id,
      ordering,
    });
  };

  const isRequired = (ideaStatus: IIdeaStatusData) => {
    return ideaStatus.attributes.locked === false;
  };

  const isDeletable = (ideaStatus: IIdeaStatusData) => {
    return (
      !isRequired(ideaStatus) &&
      (!ideaStatus.attributes.ideas_count ||
        ideaStatus.attributes.ideas_count === 0)
    );
  };

  if (isLoading) {
    return <Spinner />;
  }

  if (ideaStatuses) {
    const defaultStatuses = ideaStatuses?.data.filter(
      (ideaStatus) => ideaStatus.attributes.locked === false
    );

    return (
      <Section>
        {!customIdeaStatusesAllowed && (
          <Warning>
            <FormattedMessage {...messages.pricingPlanUpgrade} />
          </Warning>
        )}
        <SectionTitle>
          <FormattedMessage {...messages.titleIdeaStatuses1} />
        </SectionTitle>
        <SectionDescription>
          <FormattedMessage {...messages.subtitleInputStatuses1} />
        </SectionDescription>
        <ButtonWrapper>
          <Tooltip
            placement="top"
            theme="light"
            disabled={customIdeaStatusesAllowed}
            content={<FormattedMessage {...messages.pricingPlanUpgrade} />}
            trigger="mouseenter"
          >
            <Button
              buttonStyle="admin-dark"
              icon="plus-circle"
              linkTo={`/admin/settings/${variant}/statuses/new`}
              disabled={!customIdeaStatusesAllowed}
            >
              <FormattedMessage {...messages.addIdeaStatus} />
            </Button>
          </Tooltip>
        </ButtonWrapper>

        <SortableList
          items={ideaStatuses.data}
          lockFirstNItems={defaultStatuses.length}
          onReorder={handleReorder}
        >
          {({ lockedItemsList, itemsList, handleDragRow, handleDropRow }) => (
            <>
              {lockedItemsList?.map((defaultStatus, i) => (
                <LockedRow
                  key={defaultStatus.id}
                  isLastItem={i === itemsList.length - 1}
                >
                  <FlexTextCell className="expand">
                    <ColorLabel color={defaultStatus.attributes.color} />
                    <T value={defaultStatus.attributes.title_multiloc} />
                  </FlexTextCell>
                  <Buttons>
                    {/* This DeleteStatusButton is a dummy button. The default status can never be deleted, 
            so it's always disabled. */}
                    <DeleteStatusButton
                      buttonDisabled
                      tooltipContent={
                        customIdeaStatusesAllowed ? (
                          <FormattedMessage
                            {...messages.defaultStatusDeleteButtonTooltip}
                          />
                        ) : (
                          <FormattedMessage {...messages.pricingPlanUpgrade} />
                        )
                      }
                      ideaStatusId={defaultStatus.id}
                    />
                    <EditStatusButton
                      buttonDisabled={!customIdeaStatusesAllowed}
                      tooltipContent={
                        <FormattedMessage {...messages.pricingPlanUpgrade} />
                      }
                      linkTo={`/admin/settings/${variant}/statuses/${defaultStatus.id}`}
                    />
                  </Buttons>
                </LockedRow>
              ))}
              {itemsList.map((ideaStatus: IIdeaStatusData, index: number) => (
                <SortableRow
                  key={ideaStatus.id}
                  id={ideaStatus.id}
                  index={index}
                  isLastItem={index === itemsList.length - 1}
                  moveRow={handleDragRow}
                  dropRow={handleDropRow}
                >
                  <FlexTextCell className="expand">
                    <ColorLabel color={ideaStatus.attributes.color} />
                    <T value={ideaStatus.attributes.title_multiloc} />
                  </FlexTextCell>
                  <Buttons>
                    {customIdeaStatusesAllowed ? (
                      <DeleteStatusButton
                        buttonDisabled={!isDeletable(ideaStatus)}
                        tooltipContent={
                          <FormattedMessage
                            {...messages.inputStatusDeleteButtonTooltip}
                            values={{
                              manageTab: (
                                <b>
                                  <FormattedMessage {...messages.manage} />
                                </b>
                              ),
                            }}
                          />
                        }
                        ideaStatusId={ideaStatus.id}
                      />
                    ) : (
                      <DeleteStatusButton
                        buttonDisabled
                        tooltipContent={
                          <FormattedMessage {...messages.pricingPlanUpgrade} />
                        }
                        ideaStatusId={ideaStatus.id}
                      />
                    )}
                    <EditStatusButton
                      buttonDisabled={!customIdeaStatusesAllowed}
                      tooltipContent={
                        <FormattedMessage {...messages.pricingPlanUpgrade} />
                      }
                      linkTo={`/admin/settings/${variant}/statuses/${ideaStatus.id}`}
                    />
                  </Buttons>
                </SortableRow>
              ))}
            </>
          )}
        </SortableList>
      </Section>
    );
  }

  return null;
};

export default IdeaStatuses;
