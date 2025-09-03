import React, { MouseEvent, useState } from 'react';

import {
  Toggle,
  Badge,
  IconTooltip,
  Box,
  colors,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import permissionsCustomFieldsKeys from 'api/permissions_custom_fields/keys';
import userCustomFieldsKeys from 'api/user_custom_fields/keys';
import { IUserCustomFieldData } from 'api/user_custom_fields/types';
import useDeleteUserCustomField from 'api/user_custom_fields/useDeleteUserCustomField';
import useReorderUserCustomField from 'api/user_custom_fields/useReorderUserCustomField';
import useUpdateUserCustomField from 'api/user_custom_fields/useUpdateUserCustomField';
import useUserCustomFields from 'api/user_custom_fields/useUserCustomFields';
import { isBuiltInField, isHiddenField } from 'api/user_custom_fields/util';

import customfieldMessages from 'containers/Admin/settings/registration/CustomFieldRoutes/messages';

import { TextCell } from 'components/admin/ResourceList';
import SortableList from 'components/admin/ResourceList/SortableList';
import SortableRow from 'components/admin/ResourceList/SortableRow';
import {
  Section,
  SectionTitle,
  SectionDescription,
  SubSectionTitle,
} from 'components/admin/Section';
import T from 'components/T';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { queryClient } from 'utils/cl-react-query/queryClient';
import Link from 'utils/cl-router/Link';

import messages from './messages';

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

const CustomFieldSettings = () => {
  const { formatMessage } = useIntl();
  const { data: userCustomFields } = useUserCustomFields();
  const { mutate: deleteUserCustomField } = useDeleteUserCustomField();
  const { mutate: reorderCustomFieldForUsers } = useReorderUserCustomField();
  const { mutate: updateCustomFieldForUsers } = useUpdateUserCustomField();

  const [isProcessing, setIsProcessing] = useState(false);

  if (!userCustomFields) return null;

  const handleOnDeleteClick =
    (customFieldId: string) => (event: MouseEvent) => {
      if (!isProcessing) {
        const deleteMessage = formatMessage(
          messages.registrationQuestionDeletionConfirmation
        );
        event.preventDefault();

        if (window.confirm(deleteMessage)) {
          setIsProcessing(true);
          deleteUserCustomField(customFieldId, {
            onSuccess: () => {
              setIsProcessing(false);
              queryClient.invalidateQueries({
                queryKey: userCustomFieldsKeys.lists(),
              });
              queryClient.invalidateQueries({
                queryKey: permissionsCustomFieldsKeys.all(),
              });
            },
          });
        }
      }
    };

  const handleOnEnabledToggle = (field: IUserCustomFieldData) => {
    if (!isProcessing) {
      setIsProcessing(true);
      updateCustomFieldForUsers(
        {
          customFieldId: field.id,
          enabled: !field.attributes.enabled,
        },
        {
          onSuccess: () => {
            setIsProcessing(false);
          },
        }
      );
    }
  };

  const handleReorderCustomFieldOption = (
    customFieldId: string,
    ordering: number
  ) => {
    reorderCustomFieldForUsers({
      customFieldId,
      ordering,
    });
  };

  return (
    <Section className="intercom-settings-tab-registration-fields">
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
      <Box mb="20px">
        <SortableList
          items={userCustomFields.data}
          onReorder={handleReorderCustomFieldOption}
        >
          {({ itemsList, handleDragRow, handleDropRow }) => (
            <>
              {itemsList.map((field: IUserCustomFieldData, index: number) => {
                return (
                  <SortableRow
                    key={field.id}
                    id={field.id}
                    className="e2e-custom-registration-field-row"
                    index={index}
                    isLastItem={index === userCustomFields.data.length - 1}
                    moveRow={handleDragRow}
                    dropRow={handleDropRow}
                  >
                    <Toggle
                      className={`e2e-custom-registration-field-toggle ${
                        field.attributes.enabled ? 'enabled' : 'disabled'
                      }`}
                      checked={field.attributes.enabled}
                      disabled={isHiddenField(field)}
                      onChange={() => handleOnEnabledToggle(field)}
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
                        <FormattedMessage
                          {...customfieldMessages.defaultField}
                        />
                      </div>
                    )}
                    {isHiddenField(field) && (
                      <div>
                        <FormattedMessage
                          {...customfieldMessages.hiddenField}
                        />
                      </div>
                    )}
                    <Buttons>
                      {!isBuiltInField(field) && !isHiddenField(field) && (
                        <ButtonWithLink
                          className={`e2e-delete-custom-field-btn e2e-${field.attributes.title_multiloc['en-GB']}`}
                          onClick={handleOnDeleteClick(field.id)}
                          buttonStyle="text"
                          icon="delete"
                        >
                          <FormattedMessage
                            {...customfieldMessages.deleteButtonLabel}
                          />
                        </ButtonWithLink>
                      )}
                      {!isHiddenField(field) && (
                        <ButtonWithLink
                          className={`e2e-custom-field-edit-btn e2e-${field.attributes.title_multiloc['en-GB']} intercom-settings-tab-registration-fields-edit`}
                          linkTo={`/admin/settings/registration/custom-fields/${field.id}/field-settings`}
                          buttonStyle="secondary-outlined"
                          icon="edit"
                        >
                          <FormattedMessage
                            {...customfieldMessages.editButtonLabel}
                          />
                        </ButtonWithLink>
                      )}
                    </Buttons>
                  </SortableRow>
                );
              })}
            </>
          )}
        </SortableList>
      </Box>
      <ButtonWithLink
        buttonStyle="admin-dark"
        icon="plus-circle"
        linkTo="/admin/settings/registration/custom-fields/new"
        className="intercom-settings-tab-registration-fields-new"
      >
        <FormattedMessage {...messages.addAFieldButton} />
      </ButtonWithLink>
    </Section>
  );
};

export default CustomFieldSettings;
