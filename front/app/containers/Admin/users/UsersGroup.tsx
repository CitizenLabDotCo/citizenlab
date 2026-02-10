import React, { useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { useParams } from 'utils/router';

import useDeleteMembership from 'api/group_memberships/useDeleteMembership';
import { MembershipType } from 'api/groups/types';
import useDeleteGroup from 'api/groups/useDeleteGroup';
import useGroup from 'api/groups/useGroup';
import useUpdateGroup from 'api/groups/useUpdateGroup';
import usersKeys from 'api/users/keys';

import useFeatureFlag from 'hooks/useFeatureFlag';

import Outlet from 'components/Outlet';
import Modal from 'components/UI/Modal';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';
import FormattedMessage from 'utils/cl-intl/FormattedMessage';
import clHistory from 'utils/cl-router/history';
import eventEmitter from 'utils/eventEmitter';
import { isNilOrError } from 'utils/helperUtils';

import events from './events';
import messages from './messages';
import NormalGroupForm, { NormalFormValues } from './NormalGroupForm';
import tracks from './tracks';
import UserManager from './UserManager';
import UsersGroupHeader from './UsersGroupHeader';

const UsersGroup = () => {
  const queryClient = useQueryClient();
  const isVerificationEnabled = useFeatureFlag({ name: 'verification' });
  const { formatMessage } = useIntl();
  const { groupId } = useParams({ strict: false }) as { groupId: string };
  const { data: group } = useGroup(groupId);
  const { mutateAsync: deleteMembershipByUserId } = useDeleteMembership();
  const { mutateAsync: updateGroup } = useUpdateGroup();
  const { mutate: deleteGroup } = useDeleteGroup();
  const [groupEditionModal, setGroupEditionModal] = useState<
    false | MembershipType
  >(false);

  const closeGroupEditionModal = () => {
    setGroupEditionModal(false);
  };

  const openGroupEditionModal = () => {
    if (group) {
      const groupType = group.data.attributes.membership_type;
      trackEventByName(tracks.editGroup, {
        groupType,
      });

      setGroupEditionModal(groupType);
    }
  };

  const handleSubmitForm =
    (groupId: string) =>
    async ({
      membership_type,
      ...otherFormValues
    }: NormalFormValues & { membership_type: MembershipType }) => {
      await updateGroup({
        id: groupId,
        membership_type: membership_type as MembershipType,
        ...otherFormValues,
      });
      closeGroupEditionModal();
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
          queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
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
        />

        <UserManager
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
                onSubmit={(values) =>
                  handleSubmitForm(group.data.id)({
                    ...values,
                    membership_type: 'manual',
                  })
                }
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
