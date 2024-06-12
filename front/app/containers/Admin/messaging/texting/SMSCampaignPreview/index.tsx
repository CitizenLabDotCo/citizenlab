import React, { useState } from 'react';

import {
  Box,
  Text,
  Error,
  colors,
  fontSizes,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useDeleteTextingCampaign from 'api/texting_campaigns/useDeleteTextingCampaign';
import useSendTextingCampaign from 'api/texting_campaigns/useSendTextingCampaign';
import useTextingCampaign from 'api/texting_campaigns/useTextingCampaign';

import HelmetIntl from 'components/HelmetIntl';
import Button from 'components/UI/Button';
import Modal from 'components/UI/Modal';

import clHistory from 'utils/cl-router/history';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';
import { isNilOrError } from 'utils/helperUtils';

import TextingHeader from '../components/TextingHeader';

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
  const { mutate: deleteTextingCampaign, isLoading: isLoadingDelete } =
    useDeleteTextingCampaign();
  const { mutate: sendTextingCampaign, isLoading: isLoadingSend } =
    useSendTextingCampaign();
  const [confirmationModalIsVisible, setConfirmationModalVisible] =
    useState(false);
  const [deleteCampaignModalIsVisible, setDeleteCampaignModalVisible] =
    useState(false);
  const [hasTooManySegmentsError, setHasTooManySegmentsError] = useState(false);
  const [hasMonthlyLimitReachedError, setHasMonthlyLimitReachedError] =
    useState(false);

  const { campaignId } = props.params;
  const { data: campaign } = useTextingCampaign(campaignId);

  const isLoading = isLoadingDelete || isLoadingSend;

  const confirmSendTextingCampaign = () => {
    sendTextingCampaign(
      { id: campaignId },
      {
        onSuccess: () => {
          const url = `/admin/messaging/texting`;
          clHistory.replace(url);
        },
        onError: (e) => {
          const smsCampaignBaseErrors = e.errors.base as
            | SMSCampaignBaseError[]
            | undefined;
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
        },
      }
    );
  };

  const confirmDeleteTextingCampaign = () => {
    deleteTextingCampaign(campaignId, {
      onSuccess: () => {
        const url = `/admin/messaging/texting`;
        clHistory.replace(url);
      },
    });
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
    clHistory.replace(`/admin/messaging/texting/${campaignId}/`);
  };

  // actual error state when campaign not found
  if (isNilOrError(campaign)) return null;

  const { message, phone_numbers } = campaign.data.attributes;
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
            buttonStyle="secondary-outlined"
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
              buttonStyle="secondary-outlined"
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
              buttonStyle="secondary-outlined"
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
