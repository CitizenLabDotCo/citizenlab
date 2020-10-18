// libraries
import React from 'react';
import styled from 'styled-components';

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
import T from 'components/T';
import { FormattedMessage } from 'utils/cl-intl';

// import FeatureFlag from 'components/FeatureFlag';
// import Button from 'components/UI/Button';
// import { ButtonWrapper } from 'components/admin/PageWrapper';
import { ButtonWrapper } from 'components/admin/PageWrapper';
import CountBadge from 'components/UI/CountBadge';
import {
  Section,
  SectionTitle,
  SectionDescription,
} from 'components/admin/Section';
import {
  SortableList,
  SortableRow,
  TextCell,
} from 'components/admin/ResourceList';
import { Badge } from 'cl2-component-library';
import Button from 'components/UI/Button';

const Buttons = styled.div`
  display: flex;
  align-items: center;
`;

const StyledBadge = styled(Badge)`
  margin-left: 0.5rem;
  padding: 0.1rem 0.3rem;
  font-size: 10px;
  font-weight: bold;
`;

const Numbering = styled.span`
  margin-right: 0.5rem;
`;

const ColorLabel = styled.span`
  width: 1rem;
  height: 1rem;
  background-color: ${(props) => props.color};
  margin-right: 2rem;
  border-radius: 2px;
  display: inline-block;
`;

const FlexTextCell = styled(TextCell)`
  display: flex;
  align-items: center;
  text-transform: capitalize;
`;

const Badges = styled.div`
  display: flex;
  align-items: center;
  margin-left: 0.5rem;
`;

export default function IdeaStatuses() {
  const ideaStatuses = useIdeaStatuses();

  function handleReorder(id: string, ordering: number) {
    updateIdeaStatus(id, { ordering });
  }

  function isRequired(ideaStatus: IIdeaStatusData) {
    return ideaStatus.attributes.code === 'proposed';
  }

  function handleDelete(id: string) {
    deleteIdeaStatus(id);
  }

  function isDeletable(ideaStatus: IIdeaStatusData) {
    return !isRequired(ideaStatus) && ideaStatus.attributes.ideas_count === 0;
  }

  return ideaStatuses ? (
    <Section>
      <SectionTitle>
        <FormattedMessage {...messages.titleIdeaStatuses} />
      </SectionTitle>
      <SectionDescription>
        <FormattedMessage {...messages.subtitleIdeaStatuses} />
      </SectionDescription>
      <ButtonWrapper>
        <Button
          className="e2e-add-custom-field-btn"
          buttonStyle="cl-blue"
          icon="plus-circle"
          linkTo="/admin/ideas/statuses/new"
        >
          <FormattedMessage {...messages.addIdeaStatus} />
        </Button>
      </ButtonWrapper>

      <SortableList
        items={ideaStatuses || []}
        onReorder={handleReorder}
        id="e2e-admin-published-projects-list"
      >
        {({ itemsList, handleDragRow, handleDropRow }) =>
          itemsList.map((ideaStatus: IIdeaStatusData, index: number) => (
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
                <Numbering>{index + 1}.</Numbering>
                <T value={ideaStatus.attributes.title_multiloc} />
                <Badges>
                  <CountBadge
                    count={ideaStatus.attributes.ideas_count || 0}
                    bgColor="#147985"
                  />
                  {isRequired(ideaStatus) && (
                    <StyledBadge className="inverse">
                      <FormattedMessage {...messages.systemField} />
                    </StyledBadge>
                  )}
                </Badges>
              </FlexTextCell>
              <Buttons>
                {isDeletable(ideaStatus) && (
                  <Button
                    className={`e2e-delete-custom-field-btn e2e-${ideaStatus.attributes.title_multiloc['en-GB']}`}
                    onClick={() => handleDelete(ideaStatus.id)}
                    buttonStyle="text"
                    icon="delete"
                  >
                    <FormattedMessage {...messages.deleteButtonLabel} />
                  </Button>
                )}
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
          ))
        }
      </SortableList>
    </Section>
  ) : (
    <></>
  );
}
