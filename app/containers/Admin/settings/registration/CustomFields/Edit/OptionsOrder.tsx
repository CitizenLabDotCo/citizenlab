import React, { memo } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// services
import {
  IUserCustomFieldData,
  IUserCustomFieldOptionsData,
  reorderUserCustomFieldOption,
  deleteUserCustomFieldOption,
} from 'services/userCustomFields';

// hooks
import useUserCustomFieldOptions from 'hooks/useUserCustomFieldOptions';
import useLocalize from 'hooks/useLocalize';

// components
import {
  SortableList,
  SortableRow,
  TextCell,
} from 'components/admin/ResourceList';
import Button from 'components/UI/Button';

// i18n
import messages from '../messages';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

export interface Props {
  customField: IUserCustomFieldData;
}

const Options = memo(
  ({ customField, intl: { formatMessage } }: Props & InjectedIntlProps) => {
    const userCustomFieldOptions = useUserCustomFieldOptions(customField.id);
    const localize = useLocalize();
    const userCustomFieldId = customField.id;

    const handleReorderCustomFieldOption = (
      customFieldOptionId: string,
      ordering: number
    ) => {
      reorderUserCustomFieldOption(userCustomFieldId, customFieldOptionId, {
        ordering,
      });
    };

    const handleDeleteClick = (userCustomFieldOptionId: string) => (
      event: React.FormEvent<any>
    ) => {
      const deleteMessage = formatMessage(
        messages.customFieldOptionDeletionConfirmation
      );
      event.preventDefault();

      if (window.confirm(deleteMessage)) {
        deleteUserCustomFieldOption(userCustomFieldId, userCustomFieldOptionId);
      }
    };

    if (!isNilOrError(userCustomFieldOptions)) {
      return (
        <SortableList
          items={userCustomFieldOptions}
          onReorder={handleReorderCustomFieldOption}
          className="areas-list e2e-admin-areas-list"
          id="e2e-admin-areas-list"
        >
          {({ itemsList, handleDragRow, handleDropRow }) =>
            itemsList.map(
              (
                userCustomFieldOption: IUserCustomFieldOptionsData,
                index: number
              ) => {
                const userCustomFieldOptionId = userCustomFieldOption.id;
                return (
                  <SortableRow
                    key={userCustomFieldOptionId}
                    id={userCustomFieldOptionId}
                    index={index}
                    moveRow={handleDragRow}
                    dropRow={handleDropRow}
                    lastItem={index === userCustomFieldOptions.length - 1}
                  >
                    <TextCell className="expand">
                      {localize(
                        userCustomFieldOption.attributes.title_multiloc
                      )}
                    </TextCell>
                    <Button
                      linkTo={`/admin/settings/registration/custom_fields/${userCustomFieldId}/options-order/${userCustomFieldOptionId}`}
                      buttonStyle="secondary"
                      icon="edit"
                    >
                      {formatMessage(messages.editButtonLabel)}
                    </Button>
                    <Button
                      onClick={handleDeleteClick(userCustomFieldOptionId)}
                      buttonStyle="text"
                      icon="delete"
                    >
                      {formatMessage(messages.deleteButtonLabel)}
                    </Button>
                  </SortableRow>
                );
              }
            )
          }
        </SortableList>
      );
    }

    return null;
  }
);

export default injectIntl(Options);
