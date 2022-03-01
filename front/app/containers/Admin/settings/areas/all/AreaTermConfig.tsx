import React, { useState } from 'react';
import { mapValues, lowerCase } from 'lodash-es';

// components
import TerminologyConfig from 'components/admin/TerminologyConfig';
import { SectionField } from 'components/admin/Section';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';

// resources
import { updateAppConfiguration } from 'services/appConfiguration';

// hooks
import useAppConfiguration from 'hooks/useAppConfiguration';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import { Multiloc } from 'typings';
import messages from '../messages';

// utils
import { isNilOrError } from 'utils/helperUtils';

interface Props {
  className?: string;
}

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

  if (isNilOrError(appConfiguration)) return null;

  const save = async () => {
    await updateAppConfiguration({
      settings: {
        core: {
          areas_term: areasTerm,
          area_term: areaTerm,
        },
      },
    });
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
    <TerminologyConfig
      className={className}
      terminologyMessage={messages.subtitleTerminology}
      tooltipMessage={messages.terminologyTooltip}
      saveButtonMessage={messages.areasTermsSave}
      onSave={save}
    >
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
    </TerminologyConfig>
  );
};

export default injectIntl(AreaTermConfig);
