import React, { memo } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// services
import { IUserCustomFieldData } from 'services/userCustomFields';
import {
  IUserCustomFieldOptionData,
  reorderUserCustomFieldOption,
  deleteUserCustomFieldOption,
} from 'services/userCustomFieldOptions';

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
import { ButtonWrapper } from 'components/admin/PageWrapper';

// i18n
import messages from '../messages';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

export interface Props {
  customField: IUserCustomFieldData;
}

const RegistrationCustomFieldOptions = memo(
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
        <>
          <ButtonWrapper>
            <Button
              buttonStyle="cl-blue"
              icon="plus-circle"
              linkTo={`/admin/settings/registration/custom-fields/${userCustomFieldId}/options/new`}
            >
              {formatMessage(messages.addOption)}
            </Button>
          </ButtonWrapper>
          <SortableList
            items={userCustomFieldOptions}
            onReorder={handleReorderCustomFieldOption}
            className="areas-list e2e-admin-areas-list"
            id="e2e-admin-areas-list"
            key={userCustomFieldOptions.length}
          >
            {({ itemsList, handleDragRow, handleDropRow }) => (
              <>
                {itemsList.map(
                  (
                    userCustomFieldOption: IUserCustomFieldOptionData,
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
                          linkTo={`/admin/settings/registration/custom-fields/${userCustomFieldId}/options/${userCustomFieldOptionId}`}
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
                )}
              </>
            )}
          </SortableList>
        </>
      );
    }

    return null;
  }
);

export default injectIntl(RegistrationCustomFieldOptions);
