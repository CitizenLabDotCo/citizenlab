// libraries
import React, { Component, MouseEvent } from 'react';
import Link from 'utils/cl-router/Link';
import styled from 'styled-components';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { isEqual, clone } from 'lodash-es';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { WrappedComponentProps } from 'react-intl';
import messages from './messages';
import customfieldMessages from 'containers/Admin/settings/registration/CustomFieldRoutes/messages';
import T from 'components/T';

// components
import Button from 'components/UI/Button';
import { List, SortableRow, TextCell } from 'components/admin/ResourceList';
import {
  Toggle,
  Badge,
  IconTooltip,
  Box,
} from '@citizenlab/cl2-component-library';

import {
  Section,
  SectionTitle,
  SectionDescription,
  SubSectionTitle,
} from 'components/admin/Section';

// api
import { IUserCustomFieldData } from 'api/user_custom_fields/types';
import { queryClient } from 'utils/cl-react-query/queryClient';
import permissionsCustomFieldsKeys from 'api/permissions_custom_fields/keys';

// cache

// styling
import { colors } from 'utils/styleUtils';
import useUserCustomFields from 'api/user_custom_fields/useUserCustomFields';
import useDeleteUserCustomField from 'api/user_custom_fields/useDeleteUserCustomField';
import useReorderUserCustomField from 'api/user_custom_fields/useReorderUserCustomField';
import useUpdateUserCustomField, {
  UpdateField,
} from 'api/user_custom_fields/useUpdateUserCustomField';
import { isBuiltInField, isHiddenField } from 'api/user_custom_fields/util';
import userCustomFieldsKeys from 'api/user_custom_fields/keys';

const Buttons = styled.div`
  display: flex;
  align-items: center;
`;

const StyledBadge = styled(Badge)`
  margin-left: 10px;
`;

const StyledTextCell = styled(TextCell)`
  display: flex;
`;

const TextCellContent = styled.span`
  display: flex;
  align-items: center;
`;

const StyledIconTooltip = styled(IconTooltip)`
  margin-left: 5px;
`;

const CustomFieldsList = styled(List)`
  margin-bottom: 20px;
`;

interface State {
  itemsWhileDragging: IUserCustomFieldData[] | null;
  isProcessing: boolean;
}

export interface InputProps {}

interface DataProps {
  userCustomFields: IUserCustomFieldData[] | null | undefined;
  deleteUserCustomField: (customFieldId: string) => Promise<any>;
  reorderCustomFieldForUsers: (params: {
    customFieldId: string;
    ordering: number;
  }) => Promise<any>;
  updateCustomFieldForUsers: (params: UpdateField) => Promise<any>;
}

interface Props extends InputProps, DataProps {}

class CustomFields extends Component<Props & WrappedComponentProps, State> {
  constructor(props: Props & WrappedComponentProps) {
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

  handleOnDeleteClick = (customFieldId: string) => (event: MouseEvent) => {
    if (!this.state.isProcessing) {
      const deleteMessage = this.props.intl.formatMessage(
        messages.registrationQuestionDeletionConfirmation
      );
      event.preventDefault();

      if (window.confirm(deleteMessage)) {
        this.setState({ itemsWhileDragging: null, isProcessing: true });
        this.props.deleteUserCustomField(customFieldId).then(() => {
          this.setState({ isProcessing: false });
          queryClient.invalidateQueries({
            queryKey: userCustomFieldsKeys.lists(),
          });
          queryClient.invalidateQueries({
            queryKey: permissionsCustomFieldsKeys.all(),
          });
        });
      }
    }
  };

  handleOnEnabledToggle = (field: IUserCustomFieldData) => {
    if (!this.state.isProcessing) {
      this.setState({ isProcessing: true });
      this.props
        .updateCustomFieldForUsers({
          customFieldId: field.id,
          enabled: !field.attributes.enabled,
        })
        .then(() => {
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

  handleDragRow = (fromIndex: number, toIndex: number) => {
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
      this.props
        .reorderCustomFieldForUsers({
          customFieldId: fieldId,
          ordering: toIndex,
        })
        .then(() => this.setState({ isProcessing: false }));
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
    const {
      intl: { formatMessage },
    } = this.props;
    const listItems = this.listItems() || [];
    const listItemsLength = listItems.length;

    return (
      <Section>
        <SectionTitle>
          <FormattedMessage {...messages.registrationFields} />
        </SectionTitle>
        <SectionDescription>
          <FormattedMessage {...messages.subtitleRegistration} />
        </SectionDescription>

        <SubSectionTitle>
          <Box mr="10px">
            <FormattedMessage {...messages.customFieldsSubSectionTitle} />
          </Box>
          <IconTooltip
            content={<FormattedMessage {...messages.customFieldsTooltip} />}
          />
        </SubSectionTitle>
        <CustomFieldsList key={listItems.length}>
          {listItems.map((field, index) => {
            return (
              <SortableRow
                key={field.id}
                id={field.id}
                className="e2e-custom-registration-field-row"
                index={index}
                isLastItem={index === listItemsLength - 1}
                moveRow={this.handleDragRow}
                dropRow={this.handleDropRow}
              >
                <Toggle
                  className={`e2e-custom-registration-field-toggle ${
                    field.attributes.enabled ? 'enabled' : 'disabled'
                  }`}
                  checked={field.attributes.enabled}
                  disabled={isHiddenField(field)}
                  onChange={() => this.handleOnEnabledToggle(field)}
                />
                <StyledTextCell className="expand">
                  <TextCellContent>
                    <T value={field.attributes.title_multiloc} />
                    {field.attributes.code === 'domicile' && (
                      <StyledIconTooltip
                        content={
                          <FormattedMessage
                            {...messages.domicileManagementInfo}
                            values={{
                              geographicAreasTabLink: (
                                <Link to={'/admin/settings/areas'}>
                                  {formatMessage(
                                    messages.geographicAreasTabLinkText
                                  )}
                                </Link>
                              ),
                            }}
                          />
                        }
                      />
                    )}
                  </TextCellContent>
                  {field.attributes.required && (
                    <StyledBadge className="inverse" color={colors.error}>
                      <FormattedMessage {...customfieldMessages.required} />
                    </StyledBadge>
                  )}
                </StyledTextCell>
                {isBuiltInField(field) && (
                  <div>
                    <FormattedMessage {...customfieldMessages.defaultField} />
                  </div>
                )}
                {isHiddenField(field) && (
                  <div>
                    <FormattedMessage {...customfieldMessages.hiddenField} />
                  </div>
                )}
                <Buttons>
                  {!isBuiltInField(field) && !isHiddenField(field) && (
                    <Button
                      className={`e2e-delete-custom-field-btn e2e-${field.attributes.title_multiloc['en-GB']}`}
                      onClick={this.handleOnDeleteClick(field.id)}
                      buttonStyle="text"
                      icon="delete"
                    >
                      <FormattedMessage
                        {...customfieldMessages.deleteButtonLabel}
                      />
                    </Button>
                  )}
                  {!isHiddenField(field) && (
                    <Button
                      className={`e2e-custom-field-edit-btn e2e-${field.attributes.title_multiloc['en-GB']}`}
                      linkTo={`/admin/settings/registration/custom-fields/${field.id}/field-settings`}
                      buttonStyle="secondary"
                      icon="edit"
                    >
                      <FormattedMessage
                        {...customfieldMessages.editButtonLabel}
                      />
                    </Button>
                  )}
                </Buttons>
              </SortableRow>
            );
          })}
        </CustomFieldsList>
        <Button
          buttonStyle="cl-blue"
          icon="plus-circle"
          linkTo="/admin/settings/registration/custom-fields/new"
        >
          <FormattedMessage {...messages.addAFieldButton} />
        </Button>
      </Section>
    );
  }
}

const CustomFieldsListWithHoCs = injectIntl(CustomFields);

export default () => {
  const { data: userCustomFields } = useUserCustomFields();
  const { mutateAsync: deleteUserCustomField } = useDeleteUserCustomField();
  const { mutateAsync: reorderCustomFieldForUsers } =
    useReorderUserCustomField();
  const { mutateAsync: updateCustomFieldForUsers } = useUpdateUserCustomField();

  return (
    <DndProvider backend={HTML5Backend}>
      <CustomFieldsListWithHoCs
        userCustomFields={userCustomFields?.data}
        deleteUserCustomField={deleteUserCustomField}
        reorderCustomFieldForUsers={reorderCustomFieldForUsers}
        updateCustomFieldForUsers={updateCustomFieldForUsers}
      />
    </DndProvider>
  );
};
