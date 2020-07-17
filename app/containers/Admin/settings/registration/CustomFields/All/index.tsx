// libraries
import React, { Component } from 'react';
import GetUserCustomFields, {
  GetUserCustomFieldsChildProps,
} from 'resources/GetUserCustomFields';
import styled from 'styled-components';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { isEqual, clone } from 'lodash-es';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../messages';
import T from 'components/T';

// components
import FeatureFlag from 'components/FeatureFlag';
import Button from 'components/UI/Button';
import { ButtonWrapper } from 'components/admin/PageWrapper';
import { List, SortableRow, TextCell } from 'components/admin/ResourceList';
import Badge from 'components/admin/Badge';
import Toggle from 'components/UI/Toggle';

// services
import {
  IUserCustomFieldData,
  deleteUserCustomField,
  updateCustomFieldForUsers,
  reorderCustomFieldForUsers,
  isBuiltInField,
} from 'services/userCustomFields';

const Buttons = styled.div`
  display: flex;
  align-items: center;
`;

const StyledBadge = styled(Badge)`
  margin-left: 10px;
`;

interface State {
  itemsWhileDragging: IUserCustomFieldData[] | null;
  isProcessing: boolean;
}

export interface InputProps {}

interface DataProps {
  userCustomFields: GetUserCustomFieldsChildProps;
}

interface Props extends InputProps, DataProps {}

class CustomFields extends Component<Props & InjectedIntlProps, State> {
  constructor(props) {
    super(props);
    this.state = {
      itemsWhileDragging: null,
      isProcessing: false,
    };
  }

  componentDidUpdate(prevProps: Props) {
    const { itemsWhileDragging } = this.state;
    const prevCustomFieldsIds =
      prevProps.userCustomFields &&
      prevProps.userCustomFields.map((customField) => customField.id);
    const nextCustomFieldsIds =
      this.props.userCustomFields &&
      this.props.userCustomFields.map((customField) => customField.id);

    if (
      itemsWhileDragging &&
      !isEqual(prevCustomFieldsIds, nextCustomFieldsIds)
    ) {
      this.setState({ itemsWhileDragging: null });
    }
  }

  handleOnDeleteClick = (customFieldId) => (event) => {
    if (!this.state.isProcessing) {
      const deleteMessage = this.props.intl.formatMessage(
        messages.customFieldDeletionConfirmation
      );
      event.preventDefault();

      if (window.confirm(deleteMessage)) {
        this.setState({ itemsWhileDragging: null, isProcessing: true });
        deleteUserCustomField(customFieldId).then(() => {
          this.setState({ isProcessing: false });
        });
      }
    }
  };

  handleOnEnabledToggle = (field: IUserCustomFieldData) => () => {
    if (!this.state.isProcessing) {
      this.setState({ isProcessing: true });
      updateCustomFieldForUsers(field.id, {
        enabled: !field.attributes.enabled,
      }).then(() => {
        const listItems = this.listItems();

        if (!listItems) return;
        const newListItems = clone(listItems);
        newListItems.splice(field.attributes.ordering, 1, {
          ...field,
          attributes: {
            ...field.attributes,
            enabled: !field.attributes.enabled,
          },
        });
        this.setState({
          itemsWhileDragging: newListItems,
          isProcessing: false,
        });
      });
    }
  };

  handleDragRow = (fromIndex, toIndex) => {
    if (!this.state.isProcessing) {
      const listItems = this.listItems();

      if (!listItems) return;

      const itemsWhileDragging = clone(listItems);
      itemsWhileDragging.splice(fromIndex, 1);
      itemsWhileDragging.splice(toIndex, 0, listItems[fromIndex]);
      this.setState({ itemsWhileDragging });
    }
  };

  handleDropRow = (fieldId: string, toIndex: number) => {
    const listItems = this.listItems();

    if (!listItems) return;

    const field = listItems.find((listItem) => listItem.id === fieldId);

    if (field && field.attributes.ordering !== toIndex) {
      this.setState({ isProcessing: true });
      reorderCustomFieldForUsers(fieldId, { ordering: toIndex }).then(() =>
        this.setState({ isProcessing: false })
      );
    } else {
      this.setState({ itemsWhileDragging: null });
    }
  };

  listItems = () => {
    const { itemsWhileDragging } = this.state;
    const { userCustomFields } = this.props;
    return itemsWhileDragging || userCustomFields;
  };

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
              buttonStyle="cl-blue"
              icon="plus-circle"
              linkTo="/admin/settings/registration/custom_fields/new"
            >
              <FormattedMessage {...messages.addFieldButton} />
            </Button>
          </ButtonWrapper>
        </FeatureFlag>

        <List key={listItems.length}>
          {listItems.map((field, index) => {
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
                  className={`e2e-custom-registration-field-toggle ${
                    field.attributes.enabled ? 'enabled' : 'disabled'
                  }`}
                  checked={field.attributes.enabled}
                  onChange={this.handleOnEnabledToggle(field)}
                />
                <TextCell className="expand">
                  <T value={field.attributes.title_multiloc} />
                  {field.attributes.required && (
                    <StyledBadge className="inverse">
                      <FormattedMessage {...messages.required} />
                    </StyledBadge>
                  )}
                </TextCell>
                {isBuiltInField(field) && (
                  <div>
                    <FormattedMessage {...messages.systemField} />
                  </div>
                )}
                <Buttons>
                  {!isBuiltInField(field) && (
                    <Button
                      className={`e2e-delete-custom-field-btn e2e-${field.attributes.title_multiloc['en-GB']}`}
                      onClick={this.handleOnDeleteClick(field.id)}
                      buttonStyle="text"
                      icon="delete"
                    >
                      <FormattedMessage {...messages.deleteButtonLabel} />
                    </Button>
                  )}

                  <Button
                    className={`e2e-custom-field-edit-btn e2e-${field.attributes.title_multiloc['en-GB']}`}
                    linkTo={`/admin/settings/registration/custom_fields/${field.id}/general`}
                    buttonStyle="secondary"
                    icon="edit"
                  >
                    <FormattedMessage {...messages.editButtonLabel} />
                  </Button>
                </Buttons>
              </SortableRow>
            );
          })}
        </List>
      </>
    );
  }
}

const CustomFieldsListWithHoCs = DragDropContext(HTML5Backend)(
  injectIntl<Props>(CustomFields)
);

export default (inputProps: InputProps) => (
  <GetUserCustomFields cache={false}>
    {(customFields) => (
      <CustomFieldsListWithHoCs
        {...inputProps}
        userCustomFields={customFields}
      />
    )}
  </GetUserCustomFields>
);
