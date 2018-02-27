import * as React from 'react';
import styled from 'styled-components';
import { color } from 'utils/styleUtils';

import { injectResources, InjectedResourcesLoaderProps } from 'utils/resourceLoaders/resourcesLoader';
import { customFieldsForUsersStream, deleteCustomField, ICustomFieldData } from 'services/userCustomFields';

import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import T from 'components/T';

import { List, Row } from 'components/admin/ResourceList';
import Button from 'components/UI/Button';
import PageWrapper from 'components/admin/PageWrapper';

import messages from '../messages';


const PageTitle = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 3rem;
`;

const ButtonWrapper = styled.div`
  border-bottom: 1px solid ${color('separation')};
  margin-bottom: 0;
  padding-bottom: 2rem;
`;

const TextCell = styled.div`
  color: #333;
  font-size: 16px;
  font-weight: 400;
  line-height: 20ppx;
`;

type Props = {};

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
        <PageTitle>
          <FormattedMessage {...messages.listTitle} />
        </PageTitle>

        <PageWrapper>
          <ButtonWrapper>
            <Button
              style="cl-blue"
              circularCorners={false}
              icon="plus-circle"
              linkTo="/admin/custom_fields/new"
            >
              <FormattedMessage {...messages.addCustomFieldButton} />
            </Button>
          </ButtonWrapper>

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
                  <Button linkTo={`/admin/custom_fields/${field.id}/general`} style="secondary" circularCorners={false} icon="edit">
                    <FormattedMessage {...messages.editButtonLabel} />
                  </Button>
                </Row>
              ))}

            </List>
        </PageWrapper>
      </>
    );
  }
}

export default injectResources('customFields', customFieldsForUsersStream)(injectIntl(CustomFields));
