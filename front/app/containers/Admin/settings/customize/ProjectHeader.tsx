import React from 'react';

// components
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';
import {
  Section,
  SectionField,
  SubSectionTitle,
} from 'components/admin/Section';
import { IconTooltip } from 'cl2-component-library';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import messages from '../messages';

// utils
import { createCoreMultilocHandler } from './createHandler';

// typings
import { Multiloc } from 'typings';

interface Props {
  currentlyWorkingOnText?: Multiloc | null;
  setParentState: (state: any) => void;
}

const ProjectHeader = ({
  currentlyWorkingOnText,
  setParentState,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const handleChangeCurrentlyWorkingOnText = createCoreMultilocHandler(
    'currently_working_on_text',
    setParentState
  );

  return (
    <Section key={'project_header'}>
      <SubSectionTitle>
        <FormattedMessage {...messages.projects_header} />
        <IconTooltip
          content={formatMessage(messages.projects_header_tooltip)}
        />
      </SubSectionTitle>
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

export default injectIntl(ProjectHeader);
