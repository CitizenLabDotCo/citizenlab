import React from 'react';

// components
import TerminologyConfig from 'components/admin/TerminologyConfig';

// resources
import { updateAppConfiguration } from 'services/appConfiguration';

// hooks
import useAppConfiguration from 'hooks/useAppConfiguration';

// i18n
import messages from '../messages';

// utils
import { isNilOrError } from 'utils/helperUtils';

interface Props {
  className?: string;
}

const AreaTermConfig = ({ className }: Props) => {
  const appConfiguration = useAppConfiguration();
  if (isNilOrError(appConfiguration)) return null;

  const save = async ({ singular, plural }) => {
    await updateAppConfiguration({
      settings: {
        core: {
          area_term: singular,
          areas_term: plural,
        },
      },
    });
  };

  const { areas_term, area_term } = appConfiguration.attributes.settings.core;

  return (
    <TerminologyConfig
      className={className}
      terminologyMessage={messages.subtitleTerminology}
      tooltipMessage={messages.terminologyTooltip}
      singularValueMultiloc={area_term}
      pluralValueMultiloc={areas_term}
      singularLabelMessage={messages.areaTerm}
      pluralLabelMessage={messages.areasTerm}
      singularPlaceholderMessage={messages.areaTermPlaceholder}
      pluralPlaceholderMessage={messages.areasTermPlaceholder}
      onSave={save}
    />
  );
};

export default AreaTermConfig;
