import React, { useEffect, useState } from 'react';

import Tippy from '@tippyjs/react';
import {
  Box,
  Button,
  Checkbox,
  Label,
  Title,
  Text,
} from '@citizenlab/cl2-component-library';
import CloseIconButton from 'components/UI/CloseIconButton';
import translations from './translations';
import { FormattedMessage } from 'utils/cl-intl';

type Props = {
  tagId: string | null;
  onHide: () => void;
};

const Step1 = ({ onSetStep }) => {
  return (
    <Box>
      <Title variant="h3">
        <FormattedMessage {...translations.autoAssignQuestion} />
      </Title>

      <Box display="flex" gap="24px" mt="24px">
        <Button
          buttonStyle="primary-outlined"
          onClick={() => onSetStep('step2-auto')}
        >
          <FormattedMessage {...translations.autoAssignYes} />
        </Button>
        <Button
          buttonStyle="primary-outlined"
          onClick={() => onSetStep('step2-manual')}
        >
          <FormattedMessage {...translations.autoAssignNo} />
        </Button>
      </Box>
    </Box>
  );
};

const Step2Auto = () => {
  return (
    <Box>
      <Text>
        <FormattedMessage
          values={{
            b: (chunks) => (
              <strong style={{ fontWeight: 'bold' }}>{chunks}</strong>
            ),
          }}
          {...translations.autoAssignStep2AutoText1}
        />
      </Text>
      <Text>
        <FormattedMessage
          values={{
            b: (chunks) => (
              <strong style={{ fontWeight: 'bold' }}>{chunks}</strong>
            ),
          }}
          {...translations.autoAssignStep2AutoText2}
        />
      </Text>
    </Box>
  );
};

const Step2Manual = () => {
  return (
    <Box>
      <Text>
        <FormattedMessage {...translations.autoAssignStep2ManualText1} />
      </Text>
    </Box>
  );
};

const FirstTagAssistance = ({ tagId, onHide }: Props) => {
  const [visible, setVisible] = useState(true);
  const [step, setStep] = useState<'step1' | 'step2-manual' | 'step2-auto'>(
    'step1'
  );
  const [dontShowAgainCheckbox, setDontShowAgainCheckbox] = useState(false);

  // Re-initialize
  useEffect(() => {
    setStep('step1');
    setVisible(!dontShowAgainCheckbox);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tagId]);

  useEffect(() => {
    if (step === 'step2-manual') {
      const tagsControl = document.getElementById(`tags-control`);
      tagsControl?.scrollIntoView({ behavior: 'smooth' });
    }
    if (step === 'step2-auto') {
      const tagsControl = document.getElementById('auto-tag-button');
      tagsControl?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [step]);

  if (!tagId) return null;

  let anchorElement;
  if (step === 'step1') {
    anchorElement = document.getElementById(`tag-${tagId}`);
  } else if (step === 'step2-manual') {
    anchorElement = document.getElementById('tags-control');
  } else if (step === 'step2-auto') {
    anchorElement = document.getElementById('auto-tag-button');
  }

  if (!anchorElement) return null;

  return (
    <Tippy
      content={
        <Box p="16px" position="relative">
          <Box position="absolute" top="5px" right="5px">
            <CloseIconButton onClick={() => onHide()} />
          </Box>
          {step === 'step1' && <Step1 onSetStep={setStep} />}
          {step === 'step2-manual' && <Step2Manual />}
          {step === 'step2-auto' && <Step2Auto />}
          <Box display="flex" justifyContent="flex-start" mt="24px">
            <Label>
              <Checkbox
                checked={dontShowAgainCheckbox}
                onChange={() =>
                  setDontShowAgainCheckbox(!dontShowAgainCheckbox)
                }
              />
              <FormattedMessage {...translations.dontShowAgain} />
            </Label>
          </Box>
        </Box>
      }
      onClickOutside={() => onHide()}
      reference={anchorElement}
      zIndex={1000000000000000}
      theme="light"
      visible={visible}
      interactive
    />
  );
};

export default FirstTagAssistance;
