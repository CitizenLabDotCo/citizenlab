import React from 'react';

// components
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';
import {
  Section,
  SectionDescription,
  SectionField,
  SectionTitle,
} from 'components/admin/Section';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// utils
import { createCoreMultilocHandler } from './createHandler';

// typings
import { Multiloc } from 'typings';
import { IAttributesDiff } from '.';

interface Props {
  currentlyWorkingOnText?: Multiloc | null;
  setAttributesDiff: (state: IAttributesDiff) => void;
}

const ProjectHeader = ({
  currentlyWorkingOnText,
  setAttributesDiff,
}: Props) => {
  const handleChangeCurrentlyWorkingOnText = createCoreMultilocHandler(
    'currently_working_on_text',
    setAttributesDiff
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
