import React, { useState } from 'react';

// components
import Collapse from 'components/UI/Collapse';
import Button from 'components/UI/Button';
import { ButtonWrapper } from 'components/admin/PageWrapper';

// i18n
import { FormattedMessage, MessageDescriptor } from 'utils/cl-intl';

// styling
import styled from 'styled-components';

const Container = styled.form`
  width: 100%;
  max-width: 500px;
  padding: 25px;
  border-radius: ${(props: any) => props.theme.borderRadius};
  border: solid 1px #ddd;
  background: #fff;
`;

interface Props {
  className?: string;
  terminologyMessage: MessageDescriptor;
  tooltipMessage: MessageDescriptor;
  saveButtonMessage: MessageDescriptor;
  onSave: () => void;
  children: React.ReactNode;
}

type TSubmitState = 'enabled' | 'saving' | 'error' | 'success';

const TerminologyConfig = ({
  className,
  terminologyMessage,
  tooltipMessage,
  saveButtonMessage,
  onSave,
  children,
}: Props) => {
  const [submitState, setSubmitState] = useState<TSubmitState>('enabled');
  const [opened, setOpened] = useState<boolean>(false);

  const toggleOpened = () => setOpened((opened) => !opened);

  const save = async () => {
    setSubmitState('saving');

    try {
      await onSave();

      setSubmitState('success');
    } catch (error) {
      setSubmitState('error');
    }
  };

  return (
    <Collapse
      className={className}
      opened={opened}
      onToggle={toggleOpened}
      label={<FormattedMessage {...terminologyMessage} />}
      labelTooltipText={<FormattedMessage {...tooltipMessage} />}
    >
      <Container onSubmit={save}>
        {children}

        <ButtonWrapper>
          <Button
            processing={submitState === 'saving'}
            onClick={save}
            buttonStyle="cl-blue"
            type="submit"
          >
            <FormattedMessage {...saveButtonMessage} />
          </Button>
        </ButtonWrapper>
      </Container>
    </Collapse>
  );
};

export default TerminologyConfig;
