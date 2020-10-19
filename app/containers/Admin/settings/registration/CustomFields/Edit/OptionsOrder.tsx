import React, { memo } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// services
import {
  IUserCustomFieldData,
  IUserCustomFieldOptionsData,
  // reorderUserCustomFieldOption,
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

interface Props {
  customField: IUserCustomFieldData;
}

const Options = memo(
  ({ customField, intl: { formatMessage } }: Props & InjectedIntlProps) => {
    const userCustomFieldOptions = useUserCustomFieldOptions(customField.id);
    const localize = useLocalize();
    const userCustomFieldId = customField.id;

    const handleReorderCustomFieldOption = (
      customFieldOptionId: string,
      newOrder: number
    ) => {
      // reorderUserCustomFieldOption(customFieldOptionId, newOrder);
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
      // return (
      //   <>
      //     {userCustomFieldOptions.map((userCustomFieldOption, i) => {
      //       return (
      //         <div key={i}>
      //           {localize(userCustomFieldOption.attributes.title_multiloc)}
      //         </div>
      //       );
      //     })}
      //   </>
      // );

      return (
        <SortableList
          items={userCustomFieldOptions}
          onReorder={handleReorderCustomFieldOption}
          className="areas-list e2e-admin-areas-list"
          id="e2e-admin-areas-list"
        >
          {({ itemsList, handleDragRow, handleDropRow }) =>
            itemsList.map(
              (item: IUserCustomFieldOptionsData, index: number) => {
                return (
                  <SortableRow
                    key={item.id}
                    id={item.id}
                    index={index}
                    moveRow={handleDragRow}
                    dropRow={handleDropRow}
                    lastItem={index === userCustomFieldOptions.length - 1}
                  >
                    <TextCell className="expand">
                      {localize(item.attributes.title_multiloc)}
                    </TextCell>
                    <Button
                      linkTo={`/admin/settings/areas/${item.id}`}
                      buttonStyle="secondary"
                      icon="edit"
                    >
                      {formatMessage(messages.editButtonLabel)}
                    </Button>
                    <Button
                      onClick={handleDeleteClick(item.id)}
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
