import React, { useState } from 'react';

// components
import Button from 'components/UI/Button';
import HelmetIntl from 'components/HelmetIntl';
import TextingHeader from '../components/TextingHeader';
import Modal from 'components/UI/Modal';
import { Box, Text, Error, colors } from '@citizenlab/cl2-component-library';

// utils
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';
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

type SMSCampaignBaseError = {
  error: 'too_many_total_segments' | 'monthly_limit_reached';
};

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
        <Text fontSize="m" color="primary" as="span" fontWeight="bold">
          {title}
        </Text>
      </td>
      <td>
        <Text fontSize="m" color="primary" as="span">
          {content}
        </Text>
      </td>
    </tr>
  );
};

const SMSCampaignPreview = (props: WithRouterProps) => {
  const [confirmationModalIsVisible, setConfirmationModalVisible] =
    useState(false);
  const [deleteCampaignModalIsVisible, setDeleteCampaignModalVisible] =
    useState(false);
  const [hasTooManySegmentsError, setHasTooManySegmentsError] = useState(false);
  const [hasMonthlyLimitReachedError, setHasMonthlyLimitReachedError] =
    useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { campaignId } = props.params;
  const campaign = useTextingCampaign(campaignId);

  const confirmSendTextingCampaign = async () => {
    try {
      setIsLoading(true);
      await sendTextingCampaign(campaignId);
      const url = `/admin/messaging/texting/${campaignId}`;
      clHistory.replace(url);
    } catch (e) {
      setIsLoading(false);
      const smsCampaignBaseErrors: SMSCampaignBaseError[] | undefined =
        e.json.errors.base;
      const tooManySegmentsError = smsCampaignBaseErrors?.find(
        (smsCampaignBaseError) =>
          smsCampaignBaseError.error === 'too_many_total_segments'
      );
      const monthlyLimitReachedError = smsCampaignBaseErrors?.find(
        (smsCampaignBaseError) =>
          smsCampaignBaseError.error === 'monthly_limit_reached'
      );
      if (tooManySegmentsError) {
        setHasTooManySegmentsError(true);
      }
      if (monthlyLimitReachedError) {
        setHasMonthlyLimitReachedError(true);
      }
    }
  };

  const confirmDeleteTextingCampaign = async () => {
    try {
      setIsLoading(true);
      await deleteTextingCampaign(campaignId);
      const url = `/admin/messaging/texting`;
      clHistory.replace(url);
    } catch (e) {
      setIsLoading(false);
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
  const segmentCount = Math.ceil(message.length / 160);
  const segmentPlural = segmentCount === 1 ? 'segment' : 'segments';
  const phoneNumberPlural =
    phone_numbers.length === 1 ? 'phone number' : 'phone numbers';
  const sendCampaignButtonIsDisabled =
    hasTooManySegmentsError || hasMonthlyLimitReachedError;

  return (
    <Box background={colors.white} p="40px">
      <HelmetIntl
        title={{ id: 'test', defaultMessage: 'Preview SMS' }}
        description={{
          id: 'test',
          defaultMessage: 'Text message preview',
        }}
      />
      <TextingHeader
        headerMessage="Preview SMS"
        onClickGoBack={goBackToCampaignView}
        showHorizontalRule
      >
        <ButtonContainer>
          <Button
            onClick={goBackToCampaignView}
            buttonStyle="secondary"
            text={'Edit'}
          />
          <Button
            onClick={openSendConfirmationModal}
            buttonStyle="primary"
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
            content={`${phone_numbers.length} ${phoneNumberPlural}`}
          />
          <InformativeTableRow
            title="Usage"
            content={`${message.length} characters (${segmentCount} ${segmentPlural})`}
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
          marginBottom="35px"
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
          icon="delete"
          text={'Delete this draft SMS'}
        />
      </Box>

      {/* // send confirmation modal */}
      <Modal
        opened={confirmationModalIsVisible}
        close={closeSendConfirmationModal}
        header={'Confirm sending SMS'}
      >
        <Box padding="30px">
          <SendNowWarning>
            Do you want to send this message to {phone_numbers.length}{' '}
            {phoneNumberPlural} now?
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
              processing={isLoading}
            >
              Send Now
            </StyledModalButton>
          </Box>
          {hasTooManySegmentsError && (
            <Error text="Your SMS can't be sent. Please make the message shorter and try again or speak to your GovSuccess manager." />
          )}
          {hasMonthlyLimitReachedError && (
            <Error text="Your SMS can't be sent as your platform's monthly limit has been reached. Please try again later or speak to your GovSuccess manager." />
          )}
        </Box>
      </Modal>

      {/* // confirm delete modal */}
      <Modal
        opened={deleteCampaignModalIsVisible}
        close={closeDeleteModal}
        header={'Delete draft SMS'}
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
              icon="delete"
              iconPos="right"
            >
              Delete
            </StyledModalButton>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default withRouter(SMSCampaignPreview);
