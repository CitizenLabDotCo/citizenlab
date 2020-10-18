// libraries
import React from 'react';
import { last } from 'lodash';
import styled from 'styled-components';

import messages from '../../messages';

// streams
import useIdeaStatuses from 'hooks/useIdeaStatuses';

// components
import T from 'components/T';
import { FormattedMessage } from 'utils/cl-intl';

// import FeatureFlag from 'components/FeatureFlag';
// import Button from 'components/UI/Button';
// import { ButtonWrapper } from 'components/admin/PageWrapper';
import { ButtonWrapper } from 'components/admin/PageWrapper';
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
  background: #147985;
  color: white;
  border-color: #147985;
  font-weight: bold;
  text-transform: uppercase;
  font-size: 9px;
  padding: 0.15rem 0.35rem;
  margin-left: 1.5rem;
`;

const Numbering = styled.span`
  margin-right: 0.5rem;
`;

const ColorLabel = styled.span`
  width: 20px;
  height: 20px;
  background-color: ${(props) => props.color};
  margin-right: 2rem;
  border-radius: 2px;
  display: inline-block;
`;

const FlexTextCell = styled(TextCell)`
  display: flex;
  align-items: center;
`;

export default function IdeaStatuses() {
  const ideaStatuses = useIdeaStatuses();

  const lastIdeaStatus = last(ideaStatuses as any);

  function handleReorder() {}

  function isRequired(ideaStatus: IIdeaStatus) {
    return ideaStatus.attributes.code === 'proposed';
  }

  function handleDelete(id: string) {}

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
          linkTo="/admin/settings/registration/custom_fields/new"
        >
          <FormattedMessage {...messages.addIdeaStatus} />
        </Button>
      </ButtonWrapper>

      <SortableList
        items={ideaStatuses}
        onReorder={handleReorder}
        id="e2e-admin-published-projects-list"
      >
        {({ itemsList, handleDragRow, handleDropRow }) =>
          itemsList.map((ideaStatus: IIdeaStatus, index: number) => (
            <SortableRow
              key={ideaStatus.id}
              id={ideaStatus.id}
              index={index}
              lastItem={lastIdeaStatus == ideaStatus}
              moveRow={handleDragRow}
              dropRow={handleDropRow}
            >
              <FlexTextCell className="expand">
                <ColorLabel color={ideaStatus.attributes.color} />
                <Numbering>{index + 1}.</Numbering>
                <T value={ideaStatus.attributes.title_multiloc} />
                {isRequired(ideaStatus) && (
                  <StyledBadge>
                    <FormattedMessage {...messages.systemField} />
                  </StyledBadge>
                )}
              </FlexTextCell>
              <Buttons>
                {!isRequired(ideaStatus) && (
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
