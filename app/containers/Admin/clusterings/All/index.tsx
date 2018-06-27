import React, { PureComponent } from 'react';
import { InjectedIntlProps } from 'react-intl';
import { isNilOrError } from 'utils/helperUtils';

import GetClusterings, { GetClusteringsChildProps } from 'resources/GetClusterings';
import { deleteClustering } from 'services/clusterings';

import messages from '../messages';
import T from 'components/T';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';

import { Section, SectionTitle } from 'components/admin/Section';
import { List, Row, TextCell } from 'components/admin/ResourceList';
import Button from 'components/UI/Button';
import { ButtonWrapper } from 'components/admin/PageWrapper';


interface InputProps { }

interface DataProps {
  clusterings: GetClusteringsChildProps;
}

interface Props extends InputProps, DataProps { }

class AreaList extends PureComponent<Props & InjectedIntlProps>{
  handleDeleteClick = (areaId: string) => (event: React.FormEvent<any>) => {
    const deleteMessage = this.props.intl.formatMessage(messages.clusteringDeletionConfirmation);
    event.preventDefault();

    if (window.confirm(deleteMessage)) {
      deleteClustering(areaId);
    }
  }

  render() {
    const { clusterings } = this.props;

    if (isNilOrError(clusterings)) return null;

    return (
      <Section>
        <SectionTitle>
          <FormattedMessage {...messages.titleClusterings} />
        </SectionTitle>
        <List>
          {clusterings.map((area, index) => (
            <Row key={area.id} lastItem={(index === clusterings.length - 1)}>
              <TextCell className="expand">
                <T value={area.attributes.title_multiloc} />
              </TextCell>
              <Button
                onClick={this.handleDeleteClick(area.id)}
                style="text"
                circularCorners={false}
                icon="delete"
              >
                <FormattedMessage {...messages.deleteButtonLabel} />
              </Button>
              <Button
                linkTo={`/admin/clusterings/${area.id}`}
                style="secondary"
                circularCorners={false}
                icon="eye"
              >
                <FormattedMessage {...messages.viewButtonLabel} />
              </Button>
            </Row>
          ))}
        </List>
        <ButtonWrapper>
          <Button
            style="cl-blue"
            circularCorners={false}
            icon="plus-circle"
            linkTo="/admin/clusterings/new"
          >
            <FormattedMessage {...messages.addClusteringButton} />
          </Button>
        </ButtonWrapper>
      </Section>
    );
  }
}

const AreaListWithHoCs = injectIntl<Props>(AreaList);

export default () => (
  <GetClusterings>
    {clusterings => (<AreaListWithHoCs clusterings={clusterings} />)}
  </GetClusterings>
);
