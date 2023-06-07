import React, { memo } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// utils
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';

// services
import {
  IUserCustomFieldOptionData,
  reorderUserCustomFieldOption,
} from 'services/userCustomFieldOptions';

// hooks
import useUserCustomFieldOptions from 'api/user_custom_fields_options/useUserCustomFieldsOptions';
import useDeleteUserCustomFieldsOption from 'api/user_custom_fields_options/useDeleteUserCustomFieldsOption';
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
import { WrappedComponentProps } from 'react-intl';

const RegistrationCustomFieldOptions = memo(
  ({
    intl: { formatMessage },
    params: { userCustomFieldId },
  }: WrappedComponentProps & WithRouterProps) => {
    const { data: userCustomFieldOptions } =
      useUserCustomFieldOptions(userCustomFieldId);
    const { mutate: deleteUserCustomFieldOption } =
      useDeleteUserCustomFieldsOption();
    const localize = useLocalize();

    const handleReorderCustomFieldOption = (
      customFieldOptionId: string,
      ordering: number
    ) => {
      reorderUserCustomFieldOption(userCustomFieldId, customFieldOptionId, {
        ordering,
      });
    };

    const handleDeleteClick =
      (userCustomFieldOptionId: string) => (event: React.FormEvent<any>) => {
        const deleteMessage = formatMessage(
          messages.registrationQuestionAnswerOptionDeletionConfirmation
        );
        event.preventDefault();

        if (window.confirm(deleteMessage)) {
          deleteUserCustomFieldOption({
            customFieldId: userCustomFieldId,
            optionId: userCustomFieldOptionId,
          });
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
            items={userCustomFieldOptions.data}
            onReorder={handleReorderCustomFieldOption}
            className="areas-list e2e-admin-areas-list"
            id="e2e-admin-areas-list"
            key={userCustomFieldOptions.data.length}
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
                        isLastItem={
                          index === userCustomFieldOptions.data.length - 1
                        }
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

export default withRouter(injectIntl(RegistrationCustomFieldOptions));
