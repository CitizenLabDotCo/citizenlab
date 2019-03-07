import React, { Component } from 'react';
import { clone, isEqual } from 'lodash-es';
import { deleteCustomField, ICustomFieldData, updateCustomFieldForUsers, reorderCustomFieldForUsers, isBuiltInField } from 'services/userCustomFields';
import GetCustomFields, { GetCustomFieldsChildProps } from 'resources/GetCustomFields';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import T from 'components/T';
import { List, SortableRow, TextCell } from 'components/admin/ResourceList';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import Button from 'components/UI/Button';
import Toggle from 'components/UI/Toggle';
import messages from '../messages';
import FeatureFlag from 'components/FeatureFlag';
import { ButtonWrapper } from 'components/admin/PageWrapper';
import styled from 'styled-components';

const Buttons = styled.div`
  display: flex;
  align-items: center;
`;

export interface InputProps {}

interface DataProps {
  customFields: GetCustomFieldsChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {
  itemsWhileDragging: ICustomFieldData[] | null;
}

class CustomFields extends Component<Props & InjectedIntlProps, State> {

  constructor(props) {
    super(props);
    this.state = {
      itemsWhileDragging: null,
    };
  }

  componentDidUpdate(prevProps: Props) {
    const { itemsWhileDragging } = this.state;
    const prevCustomFieldsIds = (prevProps.customFields && prevProps.customFields.map(customField => customField.id));
    const nextCustomFieldsIds = (this.props.customFields && this.props.customFields.map(customField => customField.id));

    if (itemsWhileDragging && !isEqual(prevCustomFieldsIds, nextCustomFieldsIds)) {
      this.setState({ itemsWhileDragging: null });
    }
  }

  handleOnDeleteClick = (customFieldId) => (event) => {
    const deleteMessage = this.props.intl.formatMessage(messages.customFieldDeletionConfirmation);
    event.preventDefault();

    if (window.confirm(deleteMessage)) {
      this.setState({ itemsWhileDragging: null });
      deleteCustomField(customFieldId);
    }
  }

  handleDragRow = (fromIndex, toIndex) => {
    const listItems = this.listItems();

    if (!listItems) return;

    const itemsWhileDragging = clone(listItems);
    itemsWhileDragging.splice(fromIndex, 1);
    itemsWhileDragging.splice(toIndex, 0, listItems[fromIndex]);
    this.setState({ itemsWhileDragging });
  }

  handleDropRow = (fieldId: string, toIndex: number) => {
    const listItems = this.listItems();

    if (!listItems) return;

    const field = listItems.find(listItem => listItem.id === fieldId);

    if (field && field.attributes.ordering !== toIndex) {
      reorderCustomFieldForUsers(fieldId, { ordering: toIndex });
    } else {
      this.setState({ itemsWhileDragging: null });
    }
  }

  handleOnEnabledToggle = (field) => () => {
    updateCustomFieldForUsers(field.id, {
      enabled: !field.attributes.enabled,
    });
  }

  listItems = () => {
    const { itemsWhileDragging } = this.state;
    const { customFields } = this.props;
    return (itemsWhileDragging || customFields);
  }

  render() {
    const listItems = this.listItems() || [];
    const listItemsLength = listItems.length;
    let lastItem = false;
    return (
      <>
        <FeatureFlag name="user_custom_fields">
          <ButtonWrapper>
            <Button
              className="e2e-add-custom-field-btn"
              style="cl-blue"
              circularCorners={false}
              icon="plus-circle"
              linkTo="/admin/settings/registration/custom_fields/new"
            >
              <FormattedMessage {...messages.addFieldButton} />
            </Button>
          </ButtonWrapper>
        </FeatureFlag>
        <List key={listItems.length}>
          {
            listItems.map((field, index) => {
              if (index === listItemsLength - 1) {
                lastItem = true;
              }
              return (
                <SortableRow
                  key={field.id}
                  id={field.id}
                  className="e2e-custom-registration-field-row"
                  index={index}
                  lastItem={lastItem}
                  moveRow={this.handleDragRow}
                  dropRow={this.handleDropRow}
                >
                  <Toggle
                    className={`e2e-custom-registration-field-toggle ${field.attributes.enabled ? 'enabled' : 'disabled'}`}
                    value={field.attributes.enabled}
                    onChange={this.handleOnEnabledToggle(field)}
                  />
                  <TextCell className="expand">
                    <T value={field.attributes.title_multiloc} />
                  </TextCell>
                    {isBuiltInField(field) &&
                      <div><FormattedMessage {...messages.systemField} /></div>
                    }
                    <Buttons>
                      {!isBuiltInField(field) &&
                        <Button
                          className={`e2e-delete-custom-field-btn e2e-${field.attributes.title_multiloc['en-GB']}`}
                          onClick={this.handleOnDeleteClick(field.id)}
                          style="text"
                          icon="delete"
                        >
                          <FormattedMessage {...messages.deleteButtonLabel} />
                        </Button>
                      }

                      <Button
                        className={`e2e-custom-field-edit-btn e2e-${field.attributes.title_multiloc['en-GB']}`}
                        linkTo={`/admin/settings/registration/custom_fields/${field.id}/general`}
                        style="secondary"
                        icon="edit"
                      >
                        <FormattedMessage {...messages.editButtonLabel} />
                      </Button>
                    </Buttons>
                </SortableRow>
              );
            })
          }
        </List>
      </>
    );
  }
}

const CustomFieldsWithHoCs = DragDropContext(HTML5Backend)(injectIntl<Props>(CustomFields));

export default (inputProps: InputProps) => (
  <GetCustomFields>
    {customFields => <CustomFieldsWithHoCs {...inputProps} customFields={customFields} />}
  </GetCustomFields>
);
