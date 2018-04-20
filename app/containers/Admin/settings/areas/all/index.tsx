import React from 'react';
import styled from 'styled-components';

import messages from '../messages';
import { Section, SectionTitle } from 'components/admin/Section';
import { List, Row } from 'components/admin/ResourceList';
import { FormattedMessage } from 'utils/cl-intl';
import Button from 'components/UI/Button';

const TextCell = styled.div`
  color: #333;
  font-size: 16px;
  font-weight: 400;
  line-height: 20px;
`;

const ButtonWrapper = styled.div`
  margin-top: 2rem;
`;

export default class AdminSettingsAreas extends React.PureComponent {
  render() {
    return (
      <Section key={'signup_fields'}>
        <SectionTitle>
          <FormattedMessage {...messages.titleAreas} />
        </SectionTitle>
        <List>
          <Row>
            <TextCell className="expand">
              <FormattedMessage {...messages.titleAreas} />
            </TextCell>
            <Button style="secondary" circularCorners={false} icon="edit">
              <FormattedMessage {...messages.editButtonLabel} />
            </Button>
            <Button style="text" circularCorners={false} icon="delete">
              <FormattedMessage {...messages.deleteButtonLabel} />
            </Button>
          </Row>
        </List>
        <ButtonWrapper>
            <Button
              style="cl-blue"
              circularCorners={false}
              icon="plus-circle"
              linkTo="/admin/settings/areas/new"
            >
              <FormattedMessage {...messages.addAreaButton} />
            </Button>
          </ButtonWrapper>
      </Section>
    );
  }
}
