import React from 'react';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useUpdateAppConfiguration from 'api/app_configuration/useUpdateAppConfiguration';

import TerminologyConfig from 'components/admin/TerminologyConfig';

import { isNilOrError } from 'utils/helperUtils';

import messages from '../messages';

interface Props {
  className?: string;
}

const AreaTermConfig = ({ className }: Props) => {
  const { data: appConfiguration } = useAppConfiguration();
  const { mutate: updateAppConfiguration, isLoading } =
    useUpdateAppConfiguration();
  if (isNilOrError(appConfiguration)) return null;

  const save = ({ singular, plural }) => {
    updateAppConfiguration({
      settings: {
        core: {
          area_term: singular,
          areas_term: plural,
        },
      },
    });
  };

  const { areas_term, area_term } =
    appConfiguration.data.attributes.settings.core;

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
      isLoading={isLoading}
    />
  );
};

export default AreaTermConfig;
