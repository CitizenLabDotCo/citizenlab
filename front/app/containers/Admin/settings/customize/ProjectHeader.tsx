import React from 'react';
// typings
import { Multiloc } from 'typings';
// i18n
import { FormattedMessage } from 'utils/cl-intl';
// components
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';
import {
  Section,
  SectionDescription,
  SectionField,
  SectionTitle,
} from 'components/admin/Section';
// utils
import { createCoreMultilocHandler } from './createHandler';
import messages from './messages';

interface Props {
  currentlyWorkingOnText?: Multiloc | null;
  setParentState: (state: any) => void;
}

const ProjectHeader = ({ currentlyWorkingOnText, setParentState }: Props) => {
  const handleChangeCurrentlyWorkingOnText = createCoreMultilocHandler(
    'currently_working_on_text',
    setParentState
  );

  return (
    <Section key={'project_header'}>
      <SectionTitle>
        <FormattedMessage {...messages.projects_header} />
      </SectionTitle>
      <SectionDescription>
        <FormattedMessage {...messages.projectsHeaderDescription} />
      </SectionDescription>
      <SectionField>
        <InputMultilocWithLocaleSwitcher
          type="text"
          valueMultiloc={currentlyWorkingOnText}
          onChange={handleChangeCurrentlyWorkingOnText}
        />
      </SectionField>
    </Section>
  );
};

export default ProjectHeader;
