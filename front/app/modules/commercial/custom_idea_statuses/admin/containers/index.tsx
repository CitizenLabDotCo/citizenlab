import React, { useMemo } from 'react';

import {
  colors,
  IconTooltip,
  Spinner,
  Tooltip,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { IIdeaStatusData } from 'api/idea_statuses/types';
import useDeleteIdeaStatus from 'api/idea_statuses/useDeleteIdeaStatus';
import useIdeaStatuses from 'api/idea_statuses/useIdeaStatuses';
import useUpdateIdeaStatus from 'api/idea_statuses/useUpdateIdeaStatus';

import { ButtonWrapper } from 'components/admin/PageWrapper';
import {
  Row,
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

import { FormattedMessage } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import messages from './messages';

const Buttons = styled.div`
  display: flex;
  align-items: center;
`;

const DummyButton = styled(Button)`
  margin-right: 10px;
`;

const DeleteButton = styled(Button)`
  margin-right: 10px;
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

const StyledIconTooltip = styled(IconTooltip)`
  margin-right: 20px;
  padding: 0 16px;
`;

const IdeaStatuses = () => {
  const { data: ideaStatuses, isLoading } = useIdeaStatuses();
  const { mutate: updateIdeaStatus } = useUpdateIdeaStatus();
  const { mutate: deleteIdeaStatus } = useDeleteIdeaStatus();

  const handleReorder = (id: string, ordering: number) => () => {
    updateIdeaStatus({ id, requestBody: { ordering } });
  };

  const isRequired = (ideaStatus: IIdeaStatusData) => {
    return ideaStatus === defaultStatus;
  };

  const handleDelete = (id: string) => () => {
    deleteIdeaStatus(id);
  };

  const isDeletable = (ideaStatus: IIdeaStatusData) => {
    return (
      !isRequired(ideaStatus) &&
      (!ideaStatus.attributes.ideas_count ||
        ideaStatus.attributes.ideas_count === 0)
    );
  };

  const defaultStatus = useMemo(() => {
    if (ideaStatuses) {
      return ideaStatuses.data.find(
        (status) => status.attributes.code === 'proposed'
      );
    }

    return null;
  }, [ideaStatuses]);

  const sortableStatuses = useMemo(() => {
    if (!isNilOrError(ideaStatuses) && defaultStatus) {
      return ideaStatuses.data.filter(
        (status) => status.attributes !== defaultStatus.attributes
      );
    }

    return [];
  }, [defaultStatus, ideaStatuses]);

  if (isLoading) {
    return <Spinner />;
  }

  if (ideaStatuses && defaultStatus) {
    return (
      <Section>
        <SectionTitle>
          <FormattedMessage {...messages.titleIdeaStatuses1} />
        </SectionTitle>
        <SectionDescription>
          <FormattedMessage {...messages.subtitleInputStatuses1} />
        </SectionDescription>
        <ButtonWrapper>
          <Button
            buttonStyle="cl-blue"
            icon="plus-circle"
            linkTo="/admin/settings/statuses/new"
          >
            <FormattedMessage {...messages.addIdeaStatus} />
          </Button>
        </ButtonWrapper>

        <Row>
          <FlexTextCell className="expand">
            <StyledIconTooltip
              content={<FormattedMessage {...messages.lockedStatusTooltip} />}
              iconSize="16px"
              placement="top"
              icon="lock"
            />
            <ColorLabel color={defaultStatus.attributes.color} />
            <T value={defaultStatus.attributes.title_multiloc} />
          </FlexTextCell>
          <Buttons>
            <Tooltip
              placement="top"
              theme="light"
              disabled={false}
              content={
                <FormattedMessage
                  {...messages.defaultStatusDeleteButtonTooltip}
                />
              }
              trigger="mouseenter"
            >
              <div>
                <DummyButton buttonStyle="text" disabled={true} icon="delete">
                  <FormattedMessage {...messages.deleteButtonLabel} />
                </DummyButton>
              </div>
            </Tooltip>

            <Button
              linkTo={`/admin/settings/statuses/${defaultStatus.id}`}
              buttonStyle="secondary"
              icon="edit"
            >
              <FormattedMessage {...messages.editButtonLabel} />
            </Button>
          </Buttons>
        </Row>

        <SortableList items={sortableStatuses} onReorder={handleReorder}>
          {({ itemsList, handleDragRow, handleDropRow }) => (
            <>
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
                    <Tooltip
                      placement="top"
                      theme="light"
                      disabled={isDeletable(ideaStatus)}
                      content={
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
                      trigger="mouseenter"
                    >
                      <div>
                        <DeleteButton
                          onClick={handleDelete(ideaStatus.id)}
                          buttonStyle="text"
                          disabled={!isDeletable(ideaStatus)}
                          icon="delete"
                          iconHoverColor={colors.red600}
                          textHoverColor={colors.red600}
                        >
                          <FormattedMessage {...messages.deleteButtonLabel} />
                        </DeleteButton>
                      </div>
                    </Tooltip>
                    <Button
                      linkTo={`/admin/settings/statuses/${ideaStatus.id}`}
                      buttonStyle="secondary"
                      icon="edit"
                    >
                      <FormattedMessage {...messages.editButtonLabel} />
                    </Button>
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
