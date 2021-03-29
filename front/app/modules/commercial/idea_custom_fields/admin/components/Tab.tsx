import { ProjectTabOptions } from 'containers/Admin/projects/edit';
import { FC, useEffect } from 'react';

import { InjectedIntlProps } from 'react-intl';
import { InsertConfigurationOptions, ITab } from 'typings';
import { injectIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  onData: (data: ProjectTabOptions<InsertConfigurationOptions<ITab>>) => void;
}

const Tab: FC<Props & InjectedIntlProps> = ({
  onData,
  intl: { formatMessage },
}) => {
  const tabName = 'ideaform';
  useEffect(() => {
    onData({
      tabOptions: {
        configuration: {
          label: formatMessage(messages.inputFormTab),
          url: 'ideaform',
          feature: 'idea_custom_fields',
          name: tabName,
        },
        insertAfterName: 'survey-results',
      },
      tabHideConditions: {
        [tabName]: function isIdeaformTabHidden(project, phases) {
          const processType = project?.attributes.process_type;
          const participationMethod = project.attributes.participation_method;

          if (
            (processType === 'continuous' &&
              participationMethod !== 'ideation' &&
              participationMethod !== 'budgeting') ||
            (processType === 'timeline' &&
              phases &&
              phases.filter((phase) => {
                return (
                  phase.attributes.participation_method === 'ideation' ||
                  phase.attributes.participation_method === 'budgeting'
                );
              }).length === 0)
          ) {
            return true;
          }

          return false;
        },
      },
    });
  }, []);
  return null;
};

export default injectIntl(Tab);
