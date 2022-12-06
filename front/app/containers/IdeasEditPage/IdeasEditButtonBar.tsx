import React, { memo } from 'react';
// i18n
import { FormattedMessage } from 'utils/cl-intl';
// utils
import eventEmitter from 'utils/eventEmitter';
import ButtonBar from 'components/ButtonBar';
// components
import Button from 'components/UI/Button';
import Error from 'components/UI/Error';
// style
import styled from 'styled-components';
import messages from './messages';

const ButtonBarInner = styled.div`
  width: 100%;
  max-width: 700px;
  display: flex;
  align-items: center;
  padding-right: 30px;
  padding-left: 30px;

  .Button {
    margin-right: 10px;
  }

  .Error {
    flex: 1;
  }
`;

interface Props {
  form?: string;
  elementId?: string;
  submitError: boolean;
  processing: boolean;
  fileOrImageError: boolean;
}

const IdeasEditButtonBar = memo(
  ({
    elementId,
    form = '',
    processing,
    fileOrImageError,
    submitError,
  }: Props) => {
    const handleOnSubmitButtonClick = () => {
      eventEmitter.emit('IdeaFormSubmitEvent');
    };

    const getSubmitErrorMessage = () => {
      if (submitError) {
        return <FormattedMessage {...messages.submitApiError} />;
      } else if (fileOrImageError) {
        return <FormattedMessage {...messages.fileUploadError} />;
      }

      return null;
    };

    const submitErrorMessage = getSubmitErrorMessage();

    return (
      <ButtonBar>
        <ButtonBarInner>
          <Button
            id={elementId}
            form={form}
            className="e2e-submit-idea-form"
            processing={processing}
            text={<FormattedMessage {...messages.editedPostSave} />}
            onClick={handleOnSubmitButtonClick}
          />
          {submitErrorMessage && (
            <Error
              text={submitErrorMessage}
              marginTop="0px"
              showBackground={false}
              showIcon={true}
            />
          )}
        </ButtonBarInner>
      </ButtonBar>
    );
  }
);

export default IdeasEditButtonBar;
