import React, { memo } from 'react';

import { WrappedComponentProps } from 'react-intl';

import { IUserCustomFieldOptionData } from 'api/user_custom_fields_options/types';
import useDeleteUserCustomFieldsOption from 'api/user_custom_fields_options/useDeleteUserCustomFieldsOption';
import useReorderUserCustomFieldOption from 'api/user_custom_fields_options/useReorderUserCustomFieldsOption';
import useUserCustomFieldOptions from 'api/user_custom_fields_options/useUserCustomFieldsOptions';

import useLocalize from 'hooks/useLocalize';

import { ButtonWrapper } from 'components/admin/PageWrapper';
import { TextCell } from 'components/admin/ResourceList';
import SortableList from 'components/admin/ResourceList/SortableList';
import SortableRow from 'components/admin/ResourceList/SortableRow';
import Button from 'components/UI/Button';

import { injectIntl } from 'utils/cl-intl';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';
import { isNilOrError } from 'utils/helperUtils';

import messages from '../messages';

const RegistrationCustomFieldOptions = memo(
  ({
    intl: { formatMessage },
    params: { userCustomFieldId },
  }: WrappedComponentProps & WithRouterProps) => {
    const { data: userCustomFieldOptions } =
      useUserCustomFieldOptions(userCustomFieldId);
    const { mutate: deleteUserCustomFieldOption } =
      useDeleteUserCustomFieldsOption();
    const { mutate: reorderUserCustomFieldOption } =
      useReorderUserCustomFieldOption();
    const localize = useLocalize();

    const handleReorderCustomFieldOption = (
      customFieldOptionId: string,
      ordering: number
    ) => {
      reorderUserCustomFieldOption({
        customFieldId: userCustomFieldId,
        optionId: customFieldOptionId,
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
              buttonStyle="admin-dark"
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
                          buttonStyle="secondary-outlined"
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
