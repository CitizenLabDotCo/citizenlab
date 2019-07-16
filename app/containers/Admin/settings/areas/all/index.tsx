import React from 'react';
import { InjectedIntlProps } from 'react-intl';
import { isNilOrError } from 'utils/helperUtils';

import GetAreas, { GetAreasChildProps } from 'resources/GetAreas';
import { deleteArea } from 'services/areas';

import messages from '../messages';
import T from 'components/T';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';

import { Section, SectionSubtitle, SectionTitle } from 'components/admin/Section';
import { List, Row, TextCell } from 'components/admin/ResourceList';
import Button from 'components/UI/Button';
import { ButtonWrapper } from 'components/admin/PageWrapper';

interface InputProps { }

interface DataProps {
  areas: GetAreasChildProps;
}

interface Props extends InputProps, DataProps { }

class AreaList extends React.PureComponent<Props & InjectedIntlProps>{
  handleDeleteClick = (areaId: string) => (event: React.FormEvent<any>) => {
    const deleteMessage = this.props.intl.formatMessage(messages.areaDeletionConfirmation);
    event.preventDefault();

    if (window.confirm(deleteMessage)) {
      deleteArea(areaId);
    }
  }

  render() {
    const { areas } = this.props;

    if (isNilOrError(areas)) return null;

    return (
      <Section>
        <SectionTitle>
          <FormattedMessage {...messages.titleAreas} />
        </SectionTitle>
        <SectionSubtitle>
          <FormattedMessage {...messages.subtitleAreas} />
        </SectionSubtitle>
        <ButtonWrapper>
          <Button
            style="cl-blue"
            icon="plus-circle"
            linkTo="/admin/settings/areas/new"
          >
            <FormattedMessage {...messages.addAreaButton} />
          </Button>
        </ButtonWrapper>
        <List>
          {areas.map((area, index) => (
            <Row key={area.id} lastItem={(index === areas.length - 1)}>
              <TextCell className="expand">
                <T value={area.attributes.title_multiloc} />
              </TextCell>
              <Button
                onClick={this.handleDeleteClick(area.id)}
                style="text"
                icon="delete"
              >
                <FormattedMessage {...messages.deleteButtonLabel} />
              </Button>
              <Button
                linkTo={`/admin/settings/areas/${area.id}`}
                style="secondary"
                icon="edit"
              >
                <FormattedMessage {...messages.editButtonLabel} />
              </Button>
            </Row>
          ))}
        </List>
      </Section>
    );
  }
}

const AreaListWithHoCs = injectIntl<Props>(AreaList);

export default () => (
  <GetAreas>
    {areas => (<AreaListWithHoCs areas={areas} />)}
  </GetAreas>
);
