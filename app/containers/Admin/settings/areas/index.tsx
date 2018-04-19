import React from 'react';
import styled from 'styled-components';

import messages from './messages';
import { Section, SectionTitle } from 'components/admin/Section';
import { List, Row } from 'components/admin/ResourceList';
import { FormattedMessage } from 'utils/cl-intl';
import Button from 'components/UI/Button';
import GetAreas, { GetAreasChildProps } from 'resources/GetAreas';
import T from 'components/T';

import { isEmpty } from 'lodash';

const TextCell = styled.div`
  color: #333;
  font-size: 16px;
  font-weight: 400;
  line-height: 20px;
`;


class AreasList extends React.PureComponent{
  render() {
    const { areas } = this.props;
    const isAreas = areas !== null && areas.length > 0;
    return (
      <Section key={'signup_fields'}>
        <SectionTitle>
          <FormattedMessage {...messages.titleAreas} />
        </SectionTitle>
        { isAreas &&
        <List>
          { areas.map(area =>
          <Row key={area.id}>
            <TextCell className="expand">
              <T value={area.attributes.title_multiloc}/>
            </TextCell>
            <Button style="secondary" circularCorners={false} icon="edit">
              <FormattedMessage {...messages.editButtonLabel} />
            </Button>
            <Button style="text" circularCorners={false} icon="delete">
              <FormattedMessage {...messages.deleteButtonLabel} />
            </Button>
          </Row>)}
        </List>}
      </Section>
    );
  }
}

export default () => (
  <GetAreas>
    {areas => (<AreasList areas={areas} />)}
  </GetAreas>
);
