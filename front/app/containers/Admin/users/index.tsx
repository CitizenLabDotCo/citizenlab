import React, { useState } from 'react';

import { media } from '@citizenlab/cl2-component-library';
import { Outlet as RouterOutlet } from 'utils/router';
import styled from 'styled-components';

import { IGroupData, MembershipType } from 'api/groups/types';
import useAddGroup from 'api/groups/useAddGroup';

import useFeatureFlag from 'hooks/useFeatureFlag';

import HelmetIntl from 'components/HelmetIntl';
import Outlet from 'components/Outlet';
import Modal from 'components/UI/Modal';

const Wrapper = styled.div`
  display: flex;
  background: #fff;
  position: fixed;
  right: 0;
  top: 0px;
  left: 210px;
  bottom: 0;
  ${media.tablet`
    left: 80px;
  `}
`;

const LeftPanel = styled(GroupsListPanel)`
  width: 300px;
  flex: 0 0 300px;

  ${media.tablet`
    width: 260px;
    flex: 0 0 260px;
  `}
`;

const ChildWrapper = styled.div`
  flex: 1;
  padding: 50px;
  background: white;
  overflow-x: auto;
  overflow-y: auto;
`;

import FormattedMessage from 'utils/cl-intl/FormattedMessage';

import GroupCreationStep1 from './GroupCreationStep1';
import GroupsListPanel from './GroupsListPanel';
import messages from './messages';
import NormalGroupForm, { NormalFormValues } from './NormalGroupForm';

export type GroupCreationModal = false | 'step1' | MembershipType;

const UsersPage = () => {
  const { mutate: addGroup } = useAddGroup();
  const [groupCreationModal, setGroupCreationModal] =
    useState<GroupCreationModal>(false);
  const isVerificationEnabled = useFeatureFlag({ name: 'verification' });

  const openGroupCreationModal = () => {
    setGroupCreationModal('step1');
  };

  const closeGroupCreationModal = () => {
    setGroupCreationModal(false);
  };

  const openStep2 = (
    groupType: IGroupData['attributes']['membership_type']
  ) => {
    setGroupCreationModal(groupType);
  };

  const handleSubmitForm = (
    formValues: NormalFormValues & { membership_type: MembershipType }
  ) => {
    addGroup(
      { ...formValues },
      {
        onSuccess: () => {
          closeGroupCreationModal();
        },
      }
    );
  };

  const renderModalHeader = () => {
    if (groupCreationModal === 'step1') {
      return <FormattedMessage {...messages.modalHeaderStep1} />;
    }
    if (groupCreationModal === 'manual') {
      return <FormattedMessage {...messages.modalHeaderStep1} />;
    }
    return (
      <Outlet
        id="app.containers.Admin.users.header"
        type={groupCreationModal}
      />
    );
  };

  return (
    <>
      <HelmetIntl
        title={messages.helmetTitle}
        description={messages.helmetDescription}
      />

      <Wrapper>
        <LeftPanel
          className="e2e-left-panel"
          onCreateGroup={openGroupCreationModal}
        />
        <ChildWrapper id="e2e-users-container">
          <RouterOutlet />
        </ChildWrapper>
      </Wrapper>

      <Modal
        header={renderModalHeader()}
        opened={groupCreationModal !== false}
        close={closeGroupCreationModal}
      >
        <>
          {groupCreationModal === 'step1' && (
            <GroupCreationStep1 onOpenStep2={openStep2} />
          )}

          {groupCreationModal === 'manual' && (
            <NormalGroupForm
              onSubmit={(values) =>
                handleSubmitForm({ ...values, membership_type: 'manual' })
              }
            />
          )}

          <Outlet
            id="app.containers.Admin.users.form"
            type={groupCreationModal}
            onSubmit={handleSubmitForm}
            isVerificationEnabled={isVerificationEnabled}
          />
        </>
      </Modal>
    </>
  );
};

export default UsersPage;
