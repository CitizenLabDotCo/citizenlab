import React, { useState } from 'react';
import { mapValues, lowerCase } from 'lodash-es';

// components
import Button from 'components/UI/Button';
import { SectionField } from 'components/admin/Section';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';
import { ButtonWrapper } from 'components/admin/PageWrapper';

// resources
import { updateAppConfiguration } from 'services/appConfiguration';

// hooks
import useAppConfiguration from 'hooks/useAppConfiguration';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import { Multiloc } from 'typings';
import messages from '../messages';

// styling
import styled from 'styled-components';

// utils
import { isNilOrError } from 'utils/helperUtils';

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
}

type TSubmitState = 'enabled' | 'saving' | 'error' | 'success';

const getTerm = (
  localTerm: Multiloc | undefined,
  configTerm: Multiloc | undefined
) => localTerm || configTerm || {};

const AreaTermConfig = ({
  className,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const appConfiguration = useAppConfiguration();

  const [areasTerm, setAreasTerm] = useState<Multiloc | undefined>(undefined);
  const [areaTerm, setAreaTerm] = useState<Multiloc | undefined>(undefined);
  const [submitState, setSubmitState] = useState<TSubmitState>('enabled');

  if (isNilOrError(appConfiguration)) return null;

  const save = async () => {
    setSubmitState('saving');

    try {
      await updateAppConfiguration({
        settings: {
          core: {
            areas_term: areasTerm,
            area_term: areaTerm,
          },
        },
      });

      setSubmitState('success');
    } catch (error) {
      setSubmitState('error');
    }
  };

  const handleAreaChange = (changedAreaTerm: Multiloc) => {
    setAreaTerm(mapValues(changedAreaTerm, lowerCase));
  };

  const handleAreasChange = (changedAreasTerm: Multiloc) => {
    setAreasTerm(mapValues(changedAreasTerm, lowerCase));
  };

  const { areas_term, area_term } =
    appConfiguration.data.attributes.settings.core;

  return (
    <Container onSubmit={save} className={className}>
      <SectionField>
        <InputMultilocWithLocaleSwitcher
          type="text"
          id="area_term"
          label={<FormattedMessage {...messages.areaTerm} />}
          valueMultiloc={getTerm(areaTerm, area_term)}
          onChange={handleAreaChange}
          placeholder={formatMessage(messages.areaTermPlaceholder)}
        />
      </SectionField>

      <SectionField>
        <InputMultilocWithLocaleSwitcher
          type="text"
          id="areas_term"
          label={<FormattedMessage {...messages.areasTerm} />}
          valueMultiloc={getTerm(areasTerm, areas_term)}
          onChange={handleAreasChange}
          placeholder={formatMessage(messages.areasTermPlaceholder)}
        />
      </SectionField>

      <ButtonWrapper>
        <Button
          processing={submitState === 'saving'}
          onClick={save}
          buttonStyle="cl-blue"
          type="submit"
        >
          <FormattedMessage {...messages.areasTermsSave} />
        </Button>
      </ButtonWrapper>
    </Container>
  );
};

export default injectIntl(AreaTermConfig);
