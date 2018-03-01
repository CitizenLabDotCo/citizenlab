import * as React from 'react';
import styled from 'styled-components';

import { injectResources, InjectedResourcesLoaderProps } from 'utils/resourceLoaders/resourcesLoader';
import { customFieldsForUsersStream, deleteCustomField, ICustomFieldData } from 'services/userCustomFields';

import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import T from 'components/T';

import { List, Row } from 'components/admin/ResourceList';
import Button from 'components/UI/Button';

import messages from '../messages';

const ButtonWrapper = styled.div`
  margin-top: 2rem;
`;

const TextCell = styled.div`
  color: #333;
  font-size: 16px;
  font-weight: 400;
  line-height: 20ppx;
`;

type Props = {
};

type State = {};

class CustomFields extends React.Component<Props & InjectedResourcesLoaderProps<ICustomFieldData> & InjectedIntlProps, State> {

  handleOnDeleteClick = (customFieldId) => (event) => {
    const deleteMessage = this.props.intl.formatMessage(messages.customFieldDeletionConfirmation);
    event.preventDefault();
    if (window.confirm(deleteMessage)) {
      deleteCustomField(customFieldId);
    }
  }

  render() {
    const { customFields } = this.props;
    return (
      <>
        <List>
          {customFields && customFields.all && customFields.all.map((field) => (
            <Row key={field.id}>
              <TextCell className="expand">
                <T value={field.attributes.title_multiloc} />
              </TextCell>
              <TextCell className="expand">
                <FormattedMessage {...messages[`inputType_${field.attributes.input_type}`]} />
              </TextCell>
              <Button onClick={this.handleOnDeleteClick(field.id)} style="text" circularCorners={false} icon="delete">
                <FormattedMessage {...messages.deleteButtonLabel} />
              </Button>
              <Button linkTo={`/admin/settings/registration/custom_fields/${field.id}/general`} style="secondary" circularCorners={false} icon="edit">
                <FormattedMessage {...messages.editButtonLabel} />
              </Button>
            </Row>
          ))}
        </List>
        <ButtonWrapper>
          <Button
            style="cl-blue"
            circularCorners={false}
            icon="plus-circle"
            linkTo="/admin/settings/registration/custom_fields/new"
          >
            <FormattedMessage {...messages.addCustomFieldButton} />
          </Button>
        </ButtonWrapper>
      </>
    );
  }
}

export default injectResources('customFields', customFieldsForUsersStream)(injectIntl(CustomFields));
