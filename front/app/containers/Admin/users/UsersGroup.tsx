// Libraries
import React, { useState } from 'react';
import { isEmpty, isString } from 'lodash-es';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';
import clHistory from 'utils/cl-router/history';

// Components
import UsersGroupHeader from './UsersGroupHeader';
import Modal from 'components/UI/Modal';
import NormalGroupForm, { NormalFormValues } from './NormalGroupForm';
import UserManager from './UserManager';

// Events
import eventEmitter from 'utils/eventEmitter';
import events from './events';

// i18n
import FormattedMessage from 'utils/cl-intl/FormattedMessage';
import messages from './messages';
import { useIntl } from 'utils/cl-intl';

// tracking
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

import Outlet from 'components/Outlet';
import { useParams } from 'react-router-dom';
import useGroup from 'api/groups/useGroup';
import useFeatureFlag from 'hooks/useFeatureFlag';
import { MembershipType } from 'api/groups/types';
import useUpdateGroup from 'api/groups/useUpdateGroup';
import useDeleteGroup from 'api/groups/useDeleteGroup';
import useDeleteMembership from 'api/group_memberships/useDeleteMembership';

const UsersGroup = () => {
  const isVerificationEnabled = useFeatureFlag({ name: 'verification' });
  const { formatMessage } = useIntl();
  const { groupId } = useParams() as { groupId: string };
  const { data: group } = useGroup(groupId);
  const { mutateAsync: deleteMembershipByUserId } = useDeleteMembership();
  const { mutate: updateGroup } = useUpdateGroup();
  const { mutate: deleteGroup } = useDeleteGroup();
  const [groupEditionModal, setGroupEditionModal] = useState<
    false | MembershipType
  >(false);
  const [search, setSearch] = useState<string | undefined>(undefined);

  const closeGroupEditionModal = () => {
    setGroupEditionModal(false);
  };

  const openGroupEditionModal = () => {
    if (group) {
      const groupType = group.data.attributes.membership_type;
      trackEventByName(tracks.editGroup.name, {
        extra: {
          groupType,
        },
      });

      setGroupEditionModal(groupType);
    }
  };

  const handleSubmitForm =
    (groupId: string) => async (values: NormalFormValues) => {
      updateGroup(
        { id: groupId, ...values },
        {
          onSuccess: () => {
            closeGroupEditionModal();
          },
        }
      );
    };

  const handleDeleteGroup = (groupId: string) => () => {
    const deleteMessage = formatMessage(messages.groupDeletionConfirmation);

    if (window.confirm(deleteMessage)) {
      deleteGroup(groupId, {
        onSuccess: () => {
          clHistory.push('/admin/users');
        },
      });
    }
  };

  const searchGroup = (searchTerm: string) => {
    setSearch(isString(searchTerm) && !isEmpty(searchTerm) ? searchTerm : '');
  };

  const deleteUsersFromGroup = async (userIds: string[]) => {
    if (group && group.data.attributes.membership_type === 'manual') {
      const deleteMessage = formatMessage(
        messages.membershipDeleteConfirmation
      );

      if (window.confirm(deleteMessage)) {
        const groupId = group.data.id;
        const promises: Promise<any>[] = [];

        userIds.forEach((userId) =>
          promises.push(deleteMembershipByUserId({ groupId, userId }))
        );

        try {
          await Promise.all(promises);
          await streams.fetchAllWith({
            apiEndpoint: [`${API_PATH}/users`],
          });
        } catch (error) {
          eventEmitter.emit<JSX.Element>(
            events.membershipDeleteFailed,
            <FormattedMessage {...messages.membershipDeleteFailed} />
          );
        }
      }
    }
  };

  const renderModalHeader = () => {
    if (groupEditionModal === 'manual') {
      return <FormattedMessage {...messages.modalHeaderManual} />;
    }
    return (
      <Outlet
        id="app.containers.Admin.users.UsersGroup.header"
        type={groupEditionModal}
      />
    );
  };

  if (!isNilOrError(group)) {
    return (
      <>
        <UsersGroupHeader
          title={group.data.attributes.title_multiloc}
          groupType={group.data.attributes.membership_type}
          onEdit={openGroupEditionModal}
          onDelete={handleDeleteGroup(group.data.id)}
          onSearch={searchGroup}
        />

        <UserManager
          search={search}
          groupId={group.data.id}
          groupType={group.data.attributes.membership_type}
          deleteUsersFromGroup={deleteUsersFromGroup}
        />

        <Modal
          header={renderModalHeader()}
          fixedHeight={true}
          opened={groupEditionModal !== false}
          close={closeGroupEditionModal}
        >
          <>
            {groupEditionModal === 'manual' && (
              <NormalGroupForm
                defaultValues={group.data.attributes}
                onSubmit={handleSubmitForm(group.data.id)}
              />
            )}

            <Outlet
              id="app.containers.Admin.users.UsersGroup.form"
              initialValues={group.data.attributes}
              type={groupEditionModal}
              onSubmit={handleSubmitForm(group.data.id)}
              isVerificationEnabled={isVerificationEnabled}
            />
          </>
        </Modal>
      </>
    );
  }

  return null;
};

export default UsersGroup;
