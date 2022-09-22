import React, { useState } from 'react';
import { mapValues, lowerCase } from 'lodash-es';

// components
import Collapse from 'components/UI/Collapse';
import { SectionField } from 'components/admin/Section';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';
import Button from 'components/UI/Button';
import { ButtonWrapper } from 'components/admin/PageWrapper';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { WrappedComponentProps, MessageDescriptor } from 'react-intl';
import messages from './messages';

// styling
import styled from 'styled-components';

// typings
import { Multiloc } from 'typings';

const Container = styled.form`
  width: 100%;
  max-width: 500px;
  padding: 25px;
  border-radius: ${(props: any) => props.theme.borderRadius};
  border: solid 1px #ddd;
  background: #fff;
`;

interface ISaveParams {
  singular: Multiloc | undefined;
  plural: Multiloc | undefined;
}

interface Props {
  className?: string;
  terminologyMessage: MessageDescriptor;
  tooltipMessage: MessageDescriptor;
  singularValueMultiloc?: Multiloc;
  pluralValueMultiloc?: Multiloc;
  singularLabelMessage: MessageDescriptor;
  pluralLabelMessage: MessageDescriptor;
  singularPlaceholderMessage: MessageDescriptor;
  pluralPlaceholderMessage: MessageDescriptor;
  onSave: (params: ISaveParams) => void;
}

type TSubmitState = 'enabled' | 'saving' | 'error' | 'success';

export const getTerm = (
  localTerm: Multiloc | undefined,
  configTerm: Multiloc | undefined
) => localTerm || configTerm || {};

const TerminologyConfig = ({
  className,
  terminologyMessage,
  tooltipMessage,
  singularValueMultiloc,
  pluralValueMultiloc,
  singularLabelMessage,
  pluralLabelMessage,
  singularPlaceholderMessage,
  pluralPlaceholderMessage,
  onSave,
  intl: { formatMessage },
}: Props & WrappedComponentProps) => {
  const [submitState, setSubmitState] = useState<TSubmitState>('enabled');
  const [opened, setOpened] = useState<boolean>(false);
  const [singular, setSingular] = useState<Multiloc | undefined>();
  const [plural, setPlural] = useState<Multiloc | undefined>();

  const toggleOpened = () => setOpened((opened) => !opened);

  const handleSingularChange = (changedTerm: Multiloc) => {
    setSingular(mapValues(changedTerm, lowerCase));
  };

  const handlePluralChange = (changedTerm: Multiloc) => {
    setPlural(mapValues(changedTerm, lowerCase));
  };

  const save = async () => {
    setSubmitState('saving');

    try {
      await onSave({ singular, plural });

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
      label={formatMessage(terminologyMessage)}
      labelTooltipText={formatMessage(tooltipMessage)}
    >
      <Container onSubmit={save}>
        <SectionField>
          <InputMultilocWithLocaleSwitcher
            type="text"
            label={formatMessage(singularLabelMessage)}
            valueMultiloc={getTerm(singular, singularValueMultiloc)}
            onChange={handleSingularChange}
            placeholder={formatMessage(singularPlaceholderMessage)}
          />
        </SectionField>

        <SectionField>
          <InputMultilocWithLocaleSwitcher
            type="text"
            label={formatMessage(pluralLabelMessage)}
            valueMultiloc={getTerm(plural, pluralValueMultiloc)}
            onChange={handlePluralChange}
            placeholder={formatMessage(pluralPlaceholderMessage)}
          />
        </SectionField>

        <ButtonWrapper>
          <Button
            processing={submitState === 'saving'}
            onClick={save}
            buttonStyle="cl-blue"
            type="submit"
          >
            {formatMessage(messages.saveButton)}
          </Button>
        </ButtonWrapper>
      </Container>
    </Collapse>
  );
};

export default injectIntl(TerminologyConfig);
