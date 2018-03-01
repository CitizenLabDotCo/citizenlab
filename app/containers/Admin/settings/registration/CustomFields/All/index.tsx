import * as React from 'react';
import { clone, find } from 'lodash';
import styled from 'styled-components';

import { injectResources, InjectedResourcesLoaderProps } from 'utils/resourceLoaders/resourcesLoader';
import { customFieldsForUsersStream, deleteCustomField, ICustomFieldData, updateCustomFieldForUsers } from 'services/userCustomFields';

import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import T from 'components/T';

import { List } from 'components/admin/ResourceList';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import Button from 'components/UI/Button';

import messages from '../messages';
import SortableRow from './SortableRow';

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

type State = {
  itemsWhileDragging?: ICustomFieldData[];
};

class CustomFields extends React.Component<Props & InjectedResourcesLoaderProps<ICustomFieldData> & InjectedIntlProps, State> {

  constructor(props) {
    super(props);
    this.state = {
      itemsWhileDragging: undefined,
    };
  }

  handleOnDeleteClick = (customFieldId) => (event) => {
    const deleteMessage = this.props.intl.formatMessage(messages.customFieldDeletionConfirmation);
    event.preventDefault();
    if (window.confirm(deleteMessage)) {
      this.setState({ itemsWhileDragging: undefined });
      deleteCustomField(customFieldId);
    }
  }

  handleMoveRowHover = (fromIndex, toIndex) => {
    const listItems = this.listItems();
    if (!listItems) return;

    const itemsWhileDragging = clone(listItems);
    itemsWhileDragging.splice(fromIndex, 1);
    itemsWhileDragging.splice(toIndex, 0, listItems[fromIndex]);
    this.setState({ itemsWhileDragging });
  }

  handleMoveRowDrop = (fieldId, toIndex) => {
    const listItems = this.listItems();
    if (!listItems) return;
    const field = find(listItems, { id: fieldId });
    if (field && field.attributes.ordering !== toIndex) {
      updateCustomFieldForUsers(fieldId, {
        ordering: toIndex,
      });
    }
  }

  listItems = () => {
    const { customFields } = this.props;
    const result =  this.state.itemsWhileDragging || (customFields && customFields.all);
    return result;
  }

  render() {
    const listItems = this.listItems() || [];
    return (
      <div>
        <List key={listItems.length}>
          {listItems.map((field, index) => (
            <SortableRow
              key={field.id}
              id={field.id}
              index={index}
              moveRow={this.handleMoveRowHover}
              dropRow={this.handleMoveRowDrop}
            >
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
            </SortableRow>
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
      </div>
    );
  }
}

export default DragDropContext(HTML5Backend)(injectResources('customFields', customFieldsForUsersStream)(injectIntl(CustomFields)));
