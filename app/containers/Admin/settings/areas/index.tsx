import React from 'react';

import GetAreas, { GetAreasChildProps } from 'resources/GetAreas';
import T from 'components/T';
import messages from './messages';

import { Section, SectionTitle } from 'components/admin/Section';
import { List, Row, TextCell } from 'components/admin/ResourceList';
import { FormattedMessage } from 'utils/cl-intl';
import Button from 'components/UI/Button';


class AreasList extends React.PureComponent{
  render() {
    const { areas } = this.props;
    const isAreas = areas !== null && areas.length > 0;
    return (
      <Section key={'signup_fields'}>
        <SectionTitle>
          <FormattedMessage {...messages.titleAreas} />
        </SectionTitle>
        {isAreas &&
        <List>
          {areas.map(area =>
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
