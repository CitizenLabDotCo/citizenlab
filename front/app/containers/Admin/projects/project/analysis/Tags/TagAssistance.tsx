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
import GoBackButton from 'components/UI/GoBackButton';

type Props = {
  tagId: string | null;
  onHide: () => void;
};

const Step1 = ({ onSetStep }) => {
  return (
    <Box>
      <Title variant="h3">
        Do you want to automatically assign inputs to your tag?
      </Title>

      <Box display="flex" gap="24px" mt="24px">
        <Button
          buttonStyle="primary-outlined"
          onClick={() => onSetStep('step2-auto')}
        >
          Yes, auto-tag
        </Button>
        <Button
          buttonStyle="primary-outlined"
          onClick={() => onSetStep('step2-manual')}
        >
          {`No, I'll do it`}
        </Button>
      </Box>
    </Box>
  );
};

const Step2Auto = ({ onSetStep }) => {
  return (
    <Box>
      <GoBackButton onClick={() => onSetStep('step1')} />
      <Text>
        There are <b>different methods</b> to automatically assign inputs to
        tags.
      </Text>
      <Text>
        Use <b>the auto-tag button</b> to launch your preferred method.
      </Text>
    </Box>
  );
};

const Step2Manual = ({ onSetStep }) => {
  return (
    <Box>
      <GoBackButton onClick={() => onSetStep('step1')} />
      <Text textAlign="right">
        Click on your tag to assign it to the currently selected input.
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
          {step === 'step2-manual' && <Step2Manual onSetStep={setStep} />}
          {step === 'step2-auto' && <Step2Auto onSetStep={setStep} />}
          <Box display="flex" justifyContent="flex-start" mt="24px">
            <Label>
              <Checkbox
                checked={dontShowAgainCheckbox}
                onChange={() =>
                  setDontShowAgainCheckbox(!dontShowAgainCheckbox)
                }
              />
              Dont show this again
            </Label>
          </Box>
        </Box>
      }
      onClickOutside={() => onHide()}
      reference={anchorElement}
      zIndex={1000000000000000}
      placement={step === 'step2-manual' ? 'left' : 'right'}
      theme="light"
      visible={visible}
      interactive
    />
  );
};

export default FirstTagAssistance;
