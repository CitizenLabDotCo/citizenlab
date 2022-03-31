import React, { useState } from 'react';

// components
import Button from 'components/UI/Button';
import HelmetIntl from 'components/HelmetIntl';
import TextingHeader from '../components/TextingHeader';
import Modal from 'components/UI/Modal';
import { Box, Text } from '@citizenlab/cl2-component-library';

// utils
import { withRouter, WithRouterProps } from 'react-router';
import clHistory from 'utils/cl-router/history';

// hooks
import useTextingCampaign from 'hooks/useTextingCampaign';

// services
import {
  deleteTextingCampaign,
  sendTextingCampaign,
} from 'services/textingCampaigns';

// styling
import styled from 'styled-components';
import { fontSizes } from 'utils/styleUtils';
import { isNilOrError } from 'utils/helperUtils';

const StyledModalButton = styled(Button)`
  margin-right: 10px;
`;

const StatusTable = styled.table`
  width: 100%;
  display: flex;
  align-content: flex-start;
  margin-bottom: 24px;

  tr > td {
    padding-right: 15px;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 15px;
`;

const SendNowWarning = styled.div`
  font-size: ${fontSizes.base}px;
  margin-bottom: 30px;
`;

const PhoneMessage = styled.div`
  & {
    background-color: #eee;
    position: relative;
    border-radius: 20px;
    padding: 8px 15px;
    margin-top: 5px;
    margin-bottom: 5px;
    text-align: left;
    display: inline-block;
    font-size: 0.9rem;
    inline-size: 212px;
    overflow-wrap: break-word;
    max-height: 410px;
  }
  &:before {
    content: '';
    position: absolute;
    z-index: 0;
    bottom: 0;
    left: -7px;
    height: 20px;
    width: 20px;
    background: #eee;
    border-bottom-right-radius: 15px;
  }
  &:after {
    content: '';
    position: absolute;
    z-index: 1;
    bottom: 0;
    left: -10px;
    width: 10px;
    height: 20px;
    background: white;
    border-bottom-right-radius: 10px;
  }
`;

const InformativeTableRow = ({
  title,
  content,
}: {
  title: string;
  content: string;
}): JSX.Element => {
  return (
    <tr>
      <td>
        <Text fontSize="m" color="adminTextColor" as="span" fontWeight="bold">
          {title}
        </Text>
      </td>
      <td>
        <Text fontSize="m" color="adminTextColor" as="span">
          {content}
        </Text>
      </td>
    </tr>
  );
};

const TextMessagePreview = (props: WithRouterProps) => {
  const [confirmationModalIsVisible, setConfirmationModalVisible] =
    useState(false);
  const [deleteCampaignModalIsVisible, setDeleteCampaignModalVisible] =
    useState(false);
  const [sendCampaignButtonIsDisabled, setSendCampaignButtonIsDisabled] =
    useState(false);

  const { campaignId } = props.params;
  const campaign = useTextingCampaign(campaignId);

  const confirmSendTextingCampaign = async () => {
    setSendCampaignButtonIsDisabled(true);
    // console.log('disable send button here');
    try {
      await sendTextingCampaign(campaignId);
      // redirect to in-progress campaign page
      const url = `/admin/messaging/texting/${campaignId}`;
      clHistory.replace(url);
    } catch (e) {
      // console.log('fail', e);
    }
  };

  const confirmDeleteTextingCampaign = async () => {
    try {
      await deleteTextingCampaign(campaignId);
      // console.log('successful delete', result);
      const url = `/admin/messaging/texting`;
      clHistory.replace(url);
    } catch (e) {
      // console.log('fail', e);
    }
  };

  const openDeleteModal = () => {
    setDeleteCampaignModalVisible(true);
  };

  const closeDeleteModal = () => {
    setDeleteCampaignModalVisible(false);
  };

  const openSendConfirmationModal = () => {
    setConfirmationModalVisible(true);
  };

  const closeSendConfirmationModal = () => {
    setConfirmationModalVisible(false);
  };

  const goBackToCampaignView = () => {
    const url = `/admin/messaging/texting/${campaignId}/`;
    clHistory.replace(url);
  };

  // actual error state when campaign not found
  if (isNilOrError(campaign)) return null;

  const { message, phone_numbers } = campaign.attributes;

  return (
    <>
      <HelmetIntl
        title={{ id: 'test', defaultMessage: 'Preview SMS' }}
        description={{
          id: 'test',
          defaultMessage: 'Text message preview',
        }}
      />
      <TextingHeader
        headerMessage="Preview SMS message"
        onClickGoBack={goBackToCampaignView}
        showHorizontalRule
      >
        <ButtonContainer>
          <Button
            onClick={goBackToCampaignView}
            buttonStyle="secondary"
            size="1"
            text={'Edit'}
          />
          <Button
            onClick={openSendConfirmationModal}
            buttonStyle="primary"
            size="1"
            icon="send"
            iconPos="right"
            text={'Send'}
          />
        </ButtonContainer>
      </TextingHeader>
      <StatusTable>
        <tbody>
          <InformativeTableRow
            title="Sending to:"
            content={`${phone_numbers.length} people`}
          />
          <InformativeTableRow
            title="Usage"
            content={`${message.length} Characters (${Math.ceil(
              message.length / 160
            )} segments)`}
          />
        </tbody>
      </StatusTable>

      {/* Phone Wrapper */}
      <Box display="flex" flexDirection="column" alignItems="center">
        {/* Phone Container */}
        <Box
          height="500px"
          width="295px"
          border="21px solid black"
          borderRadius="33px"
          position="relative"
          marginBottom="25px"
        >
          {/* Phone Bezel */}
          <Box
            position="absolute"
            width="150px"
            top="-4px"
            left="53px"
            height="23px"
            bgColor="black"
            borderRadius="4px"
          />
          {/* Messages Container */}
          <Box width="210px" margin="30px auto 0 auto">
            <PhoneMessage>{message}</PhoneMessage>
          </Box>
        </Box>
        <Button
          onClick={openDeleteModal}
          buttonStyle="delete"
          size="1"
          icon="trash"
          text={'Delete this draft SMS'}
        />
      </Box>

      {/* // send confirmation modal */}
      <Modal
        opened={confirmationModalIsVisible}
        close={closeSendConfirmationModal}
        header={'Confirm Text Sending'}
      >
        <Box padding="30px">
          <SendNowWarning>
            Do you want to send this message to {phone_numbers.length} people
            now?
          </SendNowWarning>
          <Box
            display="flex"
            justifyContent="flex-start"
            flexWrap="wrap"
            width="100%"
          >
            <StyledModalButton
              buttonStyle="secondary"
              onClick={closeSendConfirmationModal}
            >
              Cancel
            </StyledModalButton>
            <StyledModalButton
              buttonStyle="primary"
              onClick={confirmSendTextingCampaign}
              icon="send"
              iconPos="right"
              disabled={sendCampaignButtonIsDisabled}
            >
              Send Now
            </StyledModalButton>
          </Box>
        </Box>
      </Modal>

      {/* // confirm delete modal */}
      <Modal
        opened={deleteCampaignModalIsVisible}
        close={closeDeleteModal}
        header={'Delete Draft Text'}
      >
        <Box padding="30px">
          <SendNowWarning>
            Do you want to delete this draft message?
          </SendNowWarning>
          <Box
            display="flex"
            justifyContent="flex-start"
            flexWrap="wrap"
            width="100%"
          >
            <StyledModalButton
              buttonStyle="secondary"
              onClick={closeDeleteModal}
            >
              Cancel
            </StyledModalButton>
            <StyledModalButton
              buttonStyle="delete"
              onClick={confirmDeleteTextingCampaign}
              icon="trash"
              iconPos="right"
            >
              Delete
            </StyledModalButton>
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default withRouter(TextMessagePreview);
