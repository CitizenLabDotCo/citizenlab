import React from 'react';

// components
import Button from 'components/UI/Button';
import HelmetIntl from 'components/HelmetIntl';
import TextingHeader from './TextingHeader';

// i18n
// import { InjectedIntlProps } from 'react-intl';
// import { FormattedMessage } from 'utils/cl-intl';
// import messages from '../messages';
// import { API_PATH, appLocalePairs } from 'containers/App/constants';
// import { getLocalized } from 'utils/i18n';

// styling
import styled from 'styled-components';
import { ScreenReaderOnly } from 'utils/a11y';

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

const testCopy =
  'The city is considering a major landscape architectural development. Currently divided in a peculiar four-square arrangement, three new proposals re-image our Public Square into a united green space design. Let us know which one you prefer! green.ville/vote-design';

const TextMessagePreview = () => {
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
        onClickHandler={() => {}}
        showHorizontalRule
      >
        <ButtonContainer>
          <Button
            onClick={() => {}}
            buttonStyle="secondary"
            size="2"
            text={'Edit'}
          />
          <Button
            onClick={() => {}}
            buttonStyle="primary"
            size="2"
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
          onClick={() => {}}
          buttonStyle="delete"
          size="2"
          icon="trash"
          text={'Delete this SMS'}
        />
      </PhoneWrapper>

      <ScreenReaderOnly>{testCopy}</ScreenReaderOnly>
    </>
  );
};

export default TextMessagePreview;
