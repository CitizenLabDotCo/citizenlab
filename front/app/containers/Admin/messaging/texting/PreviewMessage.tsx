import React, { useState } from 'react';

// components
import Button from 'components/UI/Button';
import HelmetIntl from 'components/HelmetIntl';
import TextingHeader from './TextingHeader';
import Modal from 'components/UI/Modal';
import { ScreenReaderOnly } from 'utils/a11y';
// i18n
// import { InjectedIntlProps } from 'react-intl';
// import { FormattedMessage } from 'utils/cl-intl';
// import messages from '../messages';
// import { API_PATH, appLocalePairs } from 'containers/App/constants';
// import { getLocalized } from 'utils/i18n';

// styling
import styled from 'styled-components';
import { fontSizes } from 'utils/styleUtils';

const InformativeTitle = styled.span`
  font-weight: bold;
`;

const InformativeContent = styled.span`
  display: inline-block;
  margin-left: 10px;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 15px;
`;

// styles for the phone-shaped display

const PhoneWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const PhoneContainer = styled.div`
  height: 500px;
  width: 295px;
  border: 21px solid #000000;
  box-sizing: border-box;
  border-radius: 33px;
  position: relative;
`;

const PhoneBezel = styled.div`
  position: absolute;
  width: 150px;
  left: 53px;
  height: 25.39px;
  top: 0px;
  background-color: black;
`;

const MessagesContainer = styled.div`
  width: 210px;
  margin: 0 auto;
  margin-top: 30px;
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

const ButtonsWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
  width: 100%;

  .Button {
    margin-right: 1rem;
    margin-bottom: 0.5rem;
  }
`;

const ModalContainer = styled.div`
  padding: 30px;
`;

const SendNowWarning = styled.div`
  font-size: ${fontSizes.base}px;
  margin-bottom: 30px;
`;

const testCopy =
  'The city is considering a major landscape architectural development. Currently divided in a peculiar four-square arrangement, three new proposals re-image our Public Square into a united green space design. Let us know which one you prefer! green.ville/vote-design';

const TextMessagePreview = () => {
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showDeleteTextModal, setShowDeleteTextModal] = useState(false);

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
        onClickGoBack={() => {}}
        showHorizontalRule
      >
        <ButtonContainer>
          <Button
            onClick={() => {
              console.log('go back to the create screen');
            }}
            buttonStyle="secondary"
            size="1"
            text={'Edit'}
          />
          <Button
            onClick={() => {
              setShowConfirmationModal(true);
            }}
            buttonStyle="primary"
            size="1"
            icon="send"
            iconPos="right"
            text={'Send'}
          />
        </ButtonContainer>
      </TextingHeader>
      <div>
        <InformativeTitle>Sending to:</InformativeTitle>
        <InformativeContent>1029 people</InformativeContent>
      </div>
      <div>
        <InformativeTitle>Usage:</InformativeTitle>
        <InformativeContent>199 Characters (2 messages)</InformativeContent>
      </div>

      <PhoneWrapper>
        <PhoneContainer aria-hidden>
          <PhoneBezel></PhoneBezel>
          <MessagesContainer>
            <PhoneMessage>{testCopy}</PhoneMessage>
          </MessagesContainer>
        </PhoneContainer>
        <Button
          marginTop="15px"
          onClick={() => {
            setShowDeleteTextModal(true);
          }}
          buttonStyle="delete"
          size="1"
          icon="trash"
          text={'Delete this SMS'}
        />
      </PhoneWrapper>

      <ScreenReaderOnly>{testCopy}</ScreenReaderOnly>

      {/* // send confirmation modal */}
      <Modal
        opened={showConfirmationModal}
        close={() => {
          setShowConfirmationModal(false);
        }}
        header={'Confirm Text Sending'}
      >
        <ModalContainer>
          <SendNowWarning>
            Do you want to send this message to 1,920 people now?
          </SendNowWarning>
          <ButtonsWrapper>
            <Button buttonStyle="secondary" onClick={() => {}}>
              Edit or Delete SMS
            </Button>
            <Button
              buttonStyle="primary"
              onClick={() => {}}
              icon="send"
              iconPos="right"
            >
              Send Now
            </Button>
          </ButtonsWrapper>
        </ModalContainer>
      </Modal>

      <Modal
        opened={showDeleteTextModal}
        close={() => {
          setShowDeleteTextModal(false);
        }}
        header={'Delete Draft Text'}
      >
        <ModalContainer>
          <SendNowWarning>
            Do you want to delete this draft message?
          </SendNowWarning>
          <ButtonsWrapper>
            <Button
              buttonStyle="secondary"
              onClick={() => {
                setShowDeleteTextModal(false);
              }}
            >
              Cancel
            </Button>
            <Button
              buttonStyle="delete"
              onClick={() => {}}
              icon="trash"
              iconPos="right"
            >
              Delete
            </Button>
          </ButtonsWrapper>
        </ModalContainer>
      </Modal>
    </>
  );
};

export default TextMessagePreview;
