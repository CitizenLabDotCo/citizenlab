import React, { useState } from 'react';

import { Button, media } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { IGroupData, MembershipType } from 'api/groups/types';
import useAddGroup from 'api/groups/useAddGroup';

import HelmetIntl from 'components/HelmetIntl';
import Outlet from 'components/Outlet';
// TEMP (TAN-8590): belongs to the original Modal, commented out at the bottom
// of this file. Restore when reverting.
// import Modal from 'components/UI/Modal';
// This is a temproray to test the new SettingsModal component.
// It will be removed before merge this branch
import SettingsModal from 'components/UI/SettingsModal';

import FormattedMessage from 'utils/cl-intl/FormattedMessage';
import { Outlet as RouterOutlet } from 'utils/router';

import GroupCreationStep1 from './_shared/GroupCreationStep1';
import NormalGroupForm, { NormalFormValues } from './_shared/NormalGroupForm';
import GroupsListPanel from './GroupsListPanel';
import messages from './messages';

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

export type GroupCreationModal = false | 'step1' | MembershipType;

const UsersPage = () => {
  const { mutateAsync: addGroup } = useAddGroup();
  const [groupCreationModal, setGroupCreationModal] =
    useState<GroupCreationModal>(false);

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

  const handleSubmitForm = async (
    formValues: NormalFormValues & { membership_type: MembershipType }
  ) => {
    await addGroup({ ...formValues });
    closeGroupCreationModal();
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

      <SettingsModal
        header={renderModalHeader()}
        opened={groupCreationModal !== false}
        close={closeGroupCreationModal}
        footer={<Button buttonStyle="admin-dark">Save changes</Button>}
        sections={[
          {
            name: 'manual',
            label: messages.step1TypeNameNormal,
            icon: 'database',
            content: (
              <NormalGroupForm
                onSubmit={(values) =>
                  handleSubmitForm({ ...values, membership_type: 'manual' })
                }
              />
            ),
          },
          {
            name: 'smart',
            label: messages.step1TypeNameSmart,
            icon: 'settings',
            content: <GroupCreationStep1 onOpenStep2={openStep2} />,
          },
        ]}
      />

      {/* 

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
          />
        </>
      </Modal>

      */}
    </>
  );
};

export default UsersPage;
