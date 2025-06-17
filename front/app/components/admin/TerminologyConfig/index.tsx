import React, { useState } from 'react';

import { mapValues, lowerCase } from 'lodash-es';
import { WrappedComponentProps, MessageDescriptor } from 'react-intl';
import styled from 'styled-components';
import { Multiloc } from 'typings';

import { ButtonWrapper } from 'components/admin/PageWrapper';
import { SectionField } from 'components/admin/Section';
import ButtonWithLink from 'components/UI/ButtonWithLink';
import Collapse from 'components/UI/Collapse';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';

import { injectIntl } from 'utils/cl-intl';

import messages from './messages';

const Container = styled.form`
  width: 100%;
  max-width: 500px;
  padding: 25px;
  border-radius: ${(props) => props.theme.borderRadius};
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
  isLoading?: boolean;
}

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
  isLoading,
}: Props & WrappedComponentProps) => {
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
    onSave({ singular, plural });
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
          <ButtonWithLink
            processing={isLoading}
            onClick={save}
            buttonStyle="admin-dark"
            type="submit"
          >
            {formatMessage(messages.saveButton)}
          </ButtonWithLink>
        </ButtonWrapper>
      </Container>
    </Collapse>
  );
};

export default injectIntl(TerminologyConfig);
