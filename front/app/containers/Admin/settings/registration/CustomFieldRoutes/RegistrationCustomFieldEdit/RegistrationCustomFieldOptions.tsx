import React, { memo } from 'react';

import { WrappedComponentProps } from 'react-intl';

import { ICustomFieldOptionData } from 'api/custom_field_options/types';
import useCustomFieldOptions from 'api/custom_field_options/useCustomFieldOptions';
import useDeleteUserCustomFieldsOption from 'api/custom_field_options/useDeleteCustomFieldOption';
import useReorderCustomFieldOption from 'api/custom_field_options/useReorderCustomFieldOption';

import useLocalize from 'hooks/useLocalize';

import { ButtonWrapper } from 'components/admin/PageWrapper';
import { TextCell } from 'components/admin/ResourceList';
import SortableList from 'components/admin/ResourceList/SortableList';
import SortableRow from 'components/admin/ResourceList/SortableRow';
import Button from 'components/UI/ButtonWithLink';

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
      useCustomFieldOptions(userCustomFieldId);
    const { mutate: deleteCustomFieldOption } =
      useDeleteUserCustomFieldsOption();
    const { mutate: reorderCustomFieldOption } = useReorderCustomFieldOption();
    const localize = useLocalize();

    const handleReorderCustomFieldOption = (
      customFieldOptionId: string,
      ordering: number
    ) => {
      reorderCustomFieldOption({
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
          deleteCustomFieldOption({
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
                    userCustomFieldOption: ICustomFieldOptionData,
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
