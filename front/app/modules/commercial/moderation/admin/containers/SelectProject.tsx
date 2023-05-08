import React, { memo, useCallback } from 'react';
import { adopt } from 'react-adopt';
import FilterSelector from 'components/FilterSelector';
import useLocalize from 'hooks/useLocalize';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// resources
import GetProjects, { GetProjectsChildProps } from 'resources/GetProjects';
import { isNilOrError } from 'utils/helperUtils';

interface InputProps {
  onChange: (projectIds: string[]) => void;
  selectedProjectIds: string[];
}
interface DataProps {
  projects: GetProjectsChildProps;
}

interface Props extends DataProps, InputProps {}

const SelectProject = memo(
  ({ onChange, projects, selectedProjectIds }: Props) => {
    const localize = useLocalize();
    const handleOnChange = useCallback((newProjectIds: string[]) => {
      onChange(newProjectIds);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!isNilOrError(projects) && projects.length > 0) {
      const values = projects.map((project) => {
        return {
          text: localize(project.attributes.title_multiloc),
          value: project.id,
        };
      });

      return (
        <FilterSelector
          title={<FormattedMessage {...messages.project} />}
          name="building"
          selected={selectedProjectIds}
          values={values}
          onChange={handleOnChange}
          multipleSelectionAllowed={true}
        />
      );
    }

    return null;
  }
);

const Data = adopt<DataProps, InputProps>({
  projects: (
    <GetProjects
      publicationStatuses={['published', 'archived', 'draft']}
      canModerate={true}
    />
  ),
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <SelectProject {...inputProps} {...dataProps} />}
  </Data>
);

// TODO: useProjects hook
