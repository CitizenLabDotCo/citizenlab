import React from 'react';
import styled from 'styled-components';

import GetAreas, { GetAreasChildProps } from 'resources/GetAreas';
import { deleteArea } from 'services/areas';
import T from 'components/T';
import messages from '../messages';

import { Section, SectionTitle } from 'components/admin/Section';
import { List, Row, TextCell } from 'components/admin/ResourceList';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import Button from 'components/UI/Button';

const ButtonWrapper = styled.div`
  margin-top: 2rem;
`;

interface InputProps {}

interface DataProps {
  areas: GetAreasChildProps
}

interface Props extends InputProps, DataProps {}

class AreasList extends React.PureComponent<Props & InjectedIntlProps>{
  handleOnDeleteClick = (areaId: string) => (event: React.FormEvent<any>) => {
    const deleteMessage = this.props.intl.formatMessage(messages.areaDeletionConfirmation);
    event.preventDefault();

    if (window.confirm(deleteMessage)) {
      deleteArea(areaId);
    }
  }

  render() {
    const { areas } = this.props;
    const isAreas = areas !== null && areas.length > 0;
    return (
      <Section>
        <SectionTitle>
          <FormattedMessage {...messages.titleAreas} />
        </SectionTitle>
        {isAreas &&
        <List>
          {areas && areas.map(area =>
          <Row key={area.id}>
            <TextCell className="expand">
              <T value={area.attributes.title_multiloc}/>
            </TextCell>
            <Button style="text" circularCorners={false} onClick={this.handleOnDeleteClick(area.id)} icon="delete">
              <FormattedMessage {...messages.deleteButtonLabel} />
            </Button>
            <Button style="secondary" circularCorners={false} linkTo={`/admin/settings/areas/${area.id}`} icon="edit">
              <FormattedMessage {...messages.editButtonLabel} />
            </Button>
          </Row>)}
        </List>}
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

const AreasListWithHoCs = injectIntl<Props>(AreasList);

export default () => (
  <GetAreas>
    {areas => (<AreasListWithHoCs areas={areas} />)}
  </GetAreas>
);
