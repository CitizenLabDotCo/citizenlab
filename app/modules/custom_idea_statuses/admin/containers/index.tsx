// libraries
import React, { useMemo } from 'react';
import Link from 'utils/cl-router/Link';
import styled from 'styled-components';
import Tippy from '@tippyjs/react';
import { isNilOrError } from 'utils/helperUtils';
import { colors } from 'utils/styleUtils';

// i18n
import T from 'components/T';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// hooks
import useIdeaStatuses from 'hooks/useIdeaStatuses';

// streams
import {
  updateIdeaStatus,
  deleteIdeaStatus,
  IIdeaStatusData,
} from 'services/ideaStatuses';

// components
import { ButtonWrapper } from 'components/admin/PageWrapper';
import { IconTooltip } from 'cl2-component-library';
import {
  Section,
  SectionTitle,
  SectionDescription,
} from 'components/admin/Section';
import {
  Row,
  SortableList,
  SortableRow,
  TextCell,
} from 'components/admin/ResourceList';
import Button from 'components/UI/Button';

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
  const ideaStatuses = useIdeaStatuses();

  const handleReorder = (id: string, ordering: number) => () => {
    updateIdeaStatus(id, { ordering });
  };

  const isRequired = (ideaStatus: IIdeaStatusData) => {
    return ideaStatus === defaultStatus;
  };

  const handleDelete = (id) => (_event: React.FormEvent<any>) => {
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
    if (!isNilOrError(ideaStatuses)) {
      return ideaStatuses.find(
        (status) => status.attributes.code === 'proposed'
      );
    }

    return null;
  }, [ideaStatuses]);

  const sortableStatuses = useMemo(() => {
    if (!isNilOrError(ideaStatuses) && defaultStatus) {
      return ideaStatuses.filter(
        (status) => status.attributes !== defaultStatus.attributes
      );
    }

    return [];
  }, [defaultStatus, ideaStatuses]);

  if (!isNilOrError(ideaStatuses) && defaultStatus) {
    return (
      <Section>
        <SectionTitle>
          <FormattedMessage {...messages.titleIdeaStatuses} />
        </SectionTitle>
        <SectionDescription>
          <FormattedMessage
            {...messages.subtitleInputStatuses}
            values={{
              linkToManageTab: (
                <Link to="/admin/ideas">
                  <FormattedMessage {...messages.manage} />
                </Link>
              ),
            }}
          />
        </SectionDescription>
        <ButtonWrapper>
          <Button
            buttonStyle="cl-blue"
            icon="plus-circle"
            linkTo="/admin/ideas/statuses/new"
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
            <Tippy
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
            </Tippy>

            <Button
              linkTo={`/admin/ideas/statuses/${defaultStatus.id}`}
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
                  lastItem={index === itemsList.length - 1}
                  moveRow={handleDragRow}
                  dropRow={handleDropRow}
                >
                  <FlexTextCell className="expand">
                    <ColorLabel color={ideaStatus.attributes.color} />
                    <T value={ideaStatus.attributes.title_multiloc} />
                  </FlexTextCell>
                  <Buttons>
                    <Tippy
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
                          iconHoverColor={colors.clRedError}
                          textHoverColor={colors.clRedError}
                        >
                          <FormattedMessage {...messages.deleteButtonLabel} />
                        </DeleteButton>
                      </div>
                    </Tippy>
                    <Button
                      linkTo={`/admin/ideas/statuses/${ideaStatus.id}`}
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
