import { FC, useEffect } from 'react';
import { InjectedIntlProps } from 'react-intl';
import { GetPhasesChildProps } from 'resources/GetPhases';
import { IProjectData } from 'services/projects';
import { InsertConfigurationOptions, ITab } from 'typings';
import { injectIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import messages from './messages';

type Props = {
  onData: (data: InsertConfigurationOptions<ITab>) => void;
  project: IProjectData;
  phases: GetPhasesChildProps;
};

const Tab: FC<Props & InjectedIntlProps> = ({
  onData,
  project,
  phases,
  intl: { formatMessage },
}) => {
  useEffect(() => {
    const processType = project.attributes.process_type;
    const participationMethod = project.attributes.participation_method;

    !(
      (processType === 'continuous' &&
        participationMethod !== 'ideation' &&
        participationMethod !== 'budgeting') ||
      (processType === 'timeline' &&
        !isNilOrError(phases) &&
        phases.filter((phase) => {
          return (
            phase.attributes.participation_method === 'ideation' ||
            phase.attributes.participation_method === 'budgeting'
          );
        }).length === 0)
    ) &&
      onData({
        configuration: {
          label: formatMessage(messages.mapTab),
          name: 'map',
          url: `map`,
          feature: 'custom_maps',
        },
        insertBeforeName: 'phases',
      });
  }, [project, phases]);

  return null;
};

export default injectIntl(Tab);
