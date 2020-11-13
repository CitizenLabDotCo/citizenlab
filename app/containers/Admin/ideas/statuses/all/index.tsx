// libraries
import React, { memo, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import Tippy from '@tippyjs/react';
import { isNilOrError } from 'utils/helperUtils';

// i18n
import T from 'components/T';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';
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
import { Section, SectionDescription } from 'components/admin/Section';
import {
  Row,
  SortableList,
  SortableRow,
  TextCell,
} from 'components/admin/ResourceList';
import Button from 'components/UI/Button';

const DragHandleSpacer = styled.div`
  padding: 16px;
  height: 100%;
  align-self: flex-start;

  &::after {
    width: 20px;
    content: '';
    display: block;
  }
`;

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

const ButtonIconTooltip = styled(IconTooltip)`
  padding: 0 16px;
`;

const IdeaStatuses = memo(() => {
  const ideaStatuses = useIdeaStatuses();

  function handleReorder(id: string, ordering: number) {
    updateIdeaStatus(id, { ordering });
  }

  function isRequired(ideaStatus: IIdeaStatusData) {
    return ideaStatus.attributes.code === 'proposed';
  }

  const handleDelete = (id) => (_event: React.FormEvent<any>) => {
    deleteIdeaStatus(id);
  };

  const isDeletable = (ideaStatus: IIdeaStatusData) => {
    return !isRequired(ideaStatus) && ideaStatus.attributes.ideas_count === 0;
  };

  const defaultStatus = useMemo(() => {
    if (!isNilOrError(ideaStatuses)) {
      return ideaStatuses.find(
        (status) => status.attributes.code === 'proposed'
      );
    }

    return undefined;
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
        <SectionDescription>
          <FormattedMessage {...messages.subtitleIdeaStatuses} />
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
          <DragHandleSpacer />
          <FlexTextCell className="expand">
            <ColorLabel color={defaultStatus.attributes.color} />
            <T value={defaultStatus.attributes.title_multiloc} />
            <ButtonIconTooltip
              content={<FormattedMessage {...messages.lockedStatusTooltip} />}
              iconSize="16px"
              placement="top"
              icon="lock"
            />
          </FlexTextCell>
          <Buttons>
            <Button
              className={`e2e-custom-field-edit-btn e2e-${defaultStatus.attributes.title_multiloc['en-GB']}`}
              linkTo={`/admin/ideas/statuses/${defaultStatus.id}`}
              buttonStyle="secondary"
              icon="edit"
            >
              <FormattedMessage {...messages.editButtonLabel} />
            </Button>
          </Buttons>
        </Row>

        <SortableList
          items={sortableStatuses}
          onReorder={handleReorder}
          id="e2e-admin-published-projects-list"
        >
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
                        <FormattedMessage {...messages.deleteButtonTooltip} />
                      }
                      trigger="mouseenter"
                    >
                      <div>
                        <Button
                          className={`e2e-delete§-custom-field-btn e2e-${ideaStatus.attributes.title_multiloc['en-GB']}`}
                          onClick={handleDelete(ideaStatus.id)}
                          buttonStyle="text"
                          disabled={!isDeletable(ideaStatus)}
                          icon="delete"
                        >
                          <FormattedMessage {...messages.deleteButtonLabel} />
                        </Button>
                      </div>
                    </Tippy>
                    <Button
                      className={`e2e-custom-field-edit-btn e2e-${ideaStatus.attributes.title_multiloc['en-GB']}`}
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

  return <></>;
});

export default IdeaStatuses;
