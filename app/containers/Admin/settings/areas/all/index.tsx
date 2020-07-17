import React from 'react';
import { InjectedIntlProps } from 'react-intl';
import { isNilOrError } from 'utils/helperUtils';

import GetAreas, { GetAreasChildProps } from 'resources/GetAreas';
import { deleteArea } from 'services/areas';

import messages from '../messages';
import T from 'components/T';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';

import {
  Section,
  SectionDescription,
  SectionTitle,
} from 'components/admin/Section';
import { List, Row, TextCell } from 'components/admin/ResourceList';
import Button from 'components/UI/Button';
import { ButtonWrapper } from 'components/admin/PageWrapper';
import AreaTermConfig from './AreaTermConfig';
import Collapse from 'components/UI/Collapse';

interface InputProps {}

interface DataProps {
  areas: GetAreasChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {
  terminologyOpened: boolean;
}

class AreaList extends React.PureComponent<Props & InjectedIntlProps, State> {
  constructor(props) {
    super(props);
    this.state = {
      terminologyOpened: false,
    };
  }

  handleToggleTerminology = () => {
    this.setState(({ terminologyOpened }) => ({
      terminologyOpened: !terminologyOpened,
    }));
  };

  handleDeleteClick = (areaId: string) => (event: React.FormEvent<any>) => {
    const deleteMessage = this.props.intl.formatMessage(
      messages.areaDeletionConfirmation
    );
    event.preventDefault();

    if (window.confirm(deleteMessage)) {
      deleteArea(areaId);
    }
  };

  render() {
    const { terminologyOpened } = this.state;
    const {
      areas,
      intl: { formatMessage },
    } = this.props;

    if (isNilOrError(areas)) return null;

    return (
      <Section>
        <SectionTitle>
          <FormattedMessage {...messages.titleAreas} />
        </SectionTitle>
        <SectionDescription>
          <FormattedMessage {...messages.subtitleAreas} />
        </SectionDescription>

        <Collapse
          opened={terminologyOpened}
          onToggle={this.handleToggleTerminology}
          label={formatMessage(messages.subtitleTerminology)}
          labelTooltipText={formatMessage(messages.terminologyTooltip)}
        >
          <AreaTermConfig />
        </Collapse>

        <ButtonWrapper>
          <Button
            buttonStyle="cl-blue"
            icon="plus-circle"
            linkTo="/admin/settings/areas/new"
          >
            <FormattedMessage {...messages.addAreaButton} />
          </Button>
        </ButtonWrapper>
        <List>
          {areas.map((area, index) => (
            <Row key={area.id} isLastItem={index === areas.length - 1}>
              <TextCell className="expand">
                <T value={area.attributes.title_multiloc} />
              </TextCell>
              <Button
                onClick={this.handleDeleteClick(area.id)}
                buttonStyle="text"
                icon="delete"
              >
                <FormattedMessage {...messages.deleteButtonLabel} />
              </Button>
              <Button
                linkTo={`/admin/settings/areas/${area.id}`}
                buttonStyle="secondary"
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
  <GetAreas>{(areas) => <AreaListWithHoCs areas={areas} />}</GetAreas>
);
