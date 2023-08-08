import React, { memo } from 'react';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { WrappedComponentProps } from 'react-intl';
import messages from '../messages';

// components
import ProjectFilterDropdown from 'components/ProjectFilterDropdown';
import { Title } from '@citizenlab/cl2-component-library';

// styling
import styled, { useTheme } from 'styled-components';
import { isRtl } from 'utils/styleUtils';

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  padding-bottom: 14px;
  border-bottom: solid 1px #ccc;
  margin-bottom: 29px;
  ${isRtl`
    flex-direction: row-reverse;
  `}
`;

const ProjectFilterDropdownPositioner = styled.div`
  margin-top: auto;
  display: flex;
  align-items: center;
`;

interface Props {
  title: string;
  showProjectFilter: boolean;
  setProjectIds: (projectIds: string[]) => void;
}

const TopBar = memo<Props & WrappedComponentProps>(
  ({ title, showProjectFilter, setProjectIds, intl }) => {
    const theme = useTheme();

    return (
      <Container>
        <Title color={'tenantText'} m="0px" my="auto" variant="h3" as="h1">
          {title}
        </Title>
        <ProjectFilterDropdownPositioner>
          {showProjectFilter && (
            <>
              <ProjectFilterDropdown
                title={intl.formatMessage(messages.filterDropdownTitle)}
                onChange={setProjectIds}
                textColor={theme.colors.tenantText}
                filterSelectorStyle="button"
                listTop="44px"
              />
            </>
          )}
        </ProjectFilterDropdownPositioner>
      </Container>
    );
  }
);

export default injectIntl(TopBar);
