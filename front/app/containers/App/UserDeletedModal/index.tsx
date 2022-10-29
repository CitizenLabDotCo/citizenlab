import React from 'react';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import injectIntl from 'utils/cl-intl/injectIntl';

// style
import styled from 'styled-components';
import { fontSizes, colors, media } from 'utils/styleUtils';
import FormattedAnchor from 'components/FormattedAnchor';

// images
import illustration from './illustration.png';
import Modal from 'components/UI/Modal';
import { WrappedComponentProps } from 'react-intl';

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled.h1`
  flex-shrink: 0;
  width: 100%;
  color: ${({ theme }) => theme.colors.tenantText};
  font-size: ${fontSizes.xxl}px;
  line-height: 40px;
  font-weight: 500;
  text-align: center;
  margin: 0;
  margin-top: 20px;
  margin-bottom: 10px;
  padding: 0;

  ${media.tablet`
    max-width: auto;
    line-height: 36px;
  `}
`;

const Subtitle = styled.h3`
  flex-shrink: 0;
  width: 100%;
  max-width: 500px;
  color: ${colors.textPrimary};
  font-size: ${fontSizes.base}px;
  line-height: 25px;
  font-weight: 300;
  text-align: center;
  margin: 0;
  margin-top: 10px;
  margin-bottom: 35px;
  padding: 0;

  ${media.tablet`
    font-size: ${fontSizes.base}px;
    line-height: 21px;
    margin-bottom: 20px;
  `}
  a {
    text-decoration: underline;
    color: ${colors.textPrimary};
  }
`;

interface Props {
  userSuccessfullyDeleted: boolean;
  modalOpened: boolean;
  closeUserDeletedModal: () => void;
}

const UserDeletedModal = ({
  userSuccessfullyDeleted,
  modalOpened,
  closeUserDeletedModal,
  intl: { formatMessage },
}: Props & WrappedComponentProps) => {
  return (
    <Modal opened={modalOpened} close={closeUserDeletedModal}>
      {userSuccessfullyDeleted ? (
        <Container>
          <img src={illustration} alt="illu" />
          <Title className="e2e-user-deleted-success-modal-content">
            <FormattedMessage {...messages.userDeletedTitle} />
          </Title>
          <Subtitle>
            <FormattedAnchor
              mainMessage={messages.userDeletedSubtitle}
              mainMessageLinkKey="contactLink"
              linkTextMessage={messages.userDeletedSubtitleLinkText}
              href={formatMessage(messages.userDeletedSubtitleLinkUrl, {
                url: window.location.href,
              })}
            />
          </Subtitle>
        </Container>
      ) : (
        <FormattedMessage {...messages.userDeletionFailed} />
      )}
    </Modal>
  );
};

export default injectIntl(UserDeletedModal);
