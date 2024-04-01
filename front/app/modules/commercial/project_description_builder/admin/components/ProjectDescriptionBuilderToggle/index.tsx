import React, { useEffect, useState } from 'react';

import {
  Toggle,
  IconTooltip,
  Box,
  fontSizes,
} from '@citizenlab/cl2-component-library';
import useAddProjectDescriptionBuilderLayout from 'modules/commercial/project_description_builder/api/useAddProjectDescriptionBuilderLayout';
import useProjectDescriptionBuilderLayout from 'modules/commercial/project_description_builder/api/useProjectDescriptionBuilderLayout';
import { WrappedComponentProps } from 'react-intl';
import { RouteType } from 'routes';
import styled from 'styled-components';
import { SupportedLocale, Multiloc } from 'typings';

import useFeatureFlag from 'hooks/useFeatureFlag';

import QuillMultilocWithLocaleSwitcher from 'components/UI/QuillEditor/QuillMultilocWithLocaleSwitcher';
import Warning from 'components/UI/Warning';

import { injectIntl } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';

// Messages
import messages from '../../messages';

type ProjectDescriptionBuilderToggleProps = {
  valueMultiloc: Multiloc | undefined | null;
  onChange: (description_multiloc: Multiloc, _locale: SupportedLocale) => void;
  label: string;
  labelTooltipText: string;
  onMount: () => void;
} & WithRouterProps &
  WrappedComponentProps;

const StyledToggle = styled(Toggle)`
  margin-bottom: 30px;
`;

const StyledIconTooltip = styled(IconTooltip)`
  margin-bottom: 30px;
`;

const StyledLink = styled(Link)`
  margin-top: -10px;
  font-size: ${fontSizes.base}px;
`;

const ProjectDescriptionBuilderToggle = ({
  params,
  intl: { formatMessage },
  valueMultiloc,
  onChange,
  label,
  labelTooltipText,
  onMount,
}: ProjectDescriptionBuilderToggleProps) => {
  const featureEnabled = useFeatureFlag({
    name: 'project_description_builder',
  });
  const { data: projectDescriptionBuilderLayout } =
    useProjectDescriptionBuilderLayout(params.projectId);

  const route: RouteType = `/admin/project-description-builder/projects/${params.projectId}/description`;
  const [
    projectDescriptionBuilderLinkVisible,
    setProjectDescriptionBuilderLinkVisible,
  ] = useState<boolean | null>(null);
  const { mutateAsync: addProjectDescriptionBuilderLayout } =
    useAddProjectDescriptionBuilderLayout();

  useEffect(() => {
    if (!featureEnabled) return;
    onMount();
  }, [onMount, featureEnabled]);

  useEffect(() => {
    if (projectDescriptionBuilderLayout) {
      const projectDescriptionBuilderEnabled =
        projectDescriptionBuilderLayout.data.attributes.enabled;
      setProjectDescriptionBuilderLinkVisible(projectDescriptionBuilderEnabled);
    }
  }, [projectDescriptionBuilderLayout]);

  if (!featureEnabled) {
    return null;
  }

  const toggleProjectDescriptionBuilderLinkVisible = () => {
    toggleLayoutEnabledStatus(!projectDescriptionBuilderLinkVisible);
    setProjectDescriptionBuilderLinkVisible(
      !projectDescriptionBuilderLinkVisible
    );
  };

  const toggleLayoutEnabledStatus = async (enabled: boolean) => {
    await addProjectDescriptionBuilderLayout({
      projectId: params.projectId,
      enabled,
    });
  };

  return (
    <Box data-testid="projectDescriptionBuilderToggle">
      <Box display="flex" gap="12px">
        <StyledToggle
          id="e2e-toggle-enable-project-description-builder"
          checked={!!projectDescriptionBuilderLinkVisible}
          label={formatMessage(messages.toggleLabel)}
          onChange={toggleProjectDescriptionBuilderLinkVisible}
        />
        <StyledIconTooltip content={formatMessage(messages.toggleTooltip)} />
      </Box>

      {projectDescriptionBuilderLinkVisible && (
        <>
          <StyledLink id="e2e-project-description-builder-link" to={route}>
            {formatMessage(messages.linkText)}
          </StyledLink>
          <Box mt="10px">
            <Warning>{formatMessage(messages.layoutBuilderWarning)}</Warning>
          </Box>
        </>
      )}
      {!projectDescriptionBuilderLinkVisible && (
        <QuillMultilocWithLocaleSwitcher
          id="project-description"
          valueMultiloc={valueMultiloc}
          onChange={onChange}
          label={label}
          labelTooltipText={labelTooltipText}
          withCTAButton
        />
      )}
    </Box>
  );
};

export default injectIntl(withRouter(ProjectDescriptionBuilderToggle));
