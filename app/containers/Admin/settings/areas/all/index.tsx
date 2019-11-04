import React from 'react';
import styled from 'styled-components';
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
import AreaTermConfig from './AreaTermConfig';
import Collapse from 'components/admin/Collapse';
import InfoTooltip from 'components/UI/InfoTooltip';

const TerminologyCollapse = styled(Collapse)`
  padding-bottom: 30px;
`;

interface InputProps { }

interface DataProps {
  areas: GetAreasChildProps;
}

interface Props extends InputProps, DataProps { }

interface State {
  terminologyOpened: boolean;
}

class AreaList extends React.PureComponent<Props & InjectedIntlProps, State>{

  constructor(props) {
    super(props);
    this.state = {
      terminologyOpened: false,
    };
  }

  handleToggleTerminology = () => {
    this.setState(({ terminologyOpened }) => ({ terminologyOpened: !terminologyOpened }));
  }

  handleDeleteClick = (areaId: string) => (event: React.FormEvent<any>) => {
    const deleteMessage = this.props.intl.formatMessage(messages.areaDeletionConfirmation);
    event.preventDefault();

    if (window.confirm(deleteMessage)) {
      deleteArea(areaId);
    }
  }

  render() {
    const { terminologyOpened } = this.state;
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

        <TerminologyCollapse
          opened={terminologyOpened}
          onToggle={this.handleToggleTerminology}
          label={<>
            <FormattedMessage {...messages.subtitleTerminology} />
            <InfoTooltip {...messages.terminologyTooltip} />
          </>}
        >
          <AreaTermConfig />
        </TerminologyCollapse>

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
