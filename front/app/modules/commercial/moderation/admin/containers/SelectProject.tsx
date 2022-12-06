import React, { memo, useCallback } from 'react';
import { adopt } from 'react-adopt';
// resources
import GetProjects, { GetProjectsChildProps } from 'resources/GetProjects';
import useLocalize from 'hooks/useLocalize';
// i18n
import { FormattedMessage } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import FilterSelector from 'components/FilterSelector';
import messages from './messages';

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

    if (
      !isNilOrError(projects) &&
      projects.projectsList &&
      projects.projectsList.length > 0
    ) {
      const projectList = projects.projectsList;
      const values = projectList.map((project) => {
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
      filterCanModerate={true}
    />
  ),
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <SelectProject {...inputProps} {...dataProps} />}
  </Data>
);

// TODO: useProjects hook
