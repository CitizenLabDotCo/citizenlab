import React, { memo } from 'react';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { WrappedComponentProps } from 'react-intl';
import messages from '../messages';

// components
import ProjectFilterDropdown from 'components/ProjectFilterDropdown';
import { Icon } from '@citizenlab/cl2-component-library';

// styling
import styled, { useTheme } from 'styled-components';
import { fontSizes, isRtl } from 'utils/styleUtils';

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

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.tenantText};
  font-size: ${fontSizes.xxl}px;
  line-height: normal;
  font-weight: 600;
  text-align: left;
  margin: 0;
  padding: 0;
  padding-top: 0px;
`;

const ProjectFilterDropdownPositioner = styled.div`
  margin-top: auto;
  display: flex;
  align-items: center;
`;

const FilterIcon = styled(Icon)`
  fill: ${({ theme }) => theme.colors.tenantText};
  margin-right: 3px;
`;

interface Props {
  title: string;
  setProjectIds: (projectIds: string[]) => void;
}

const TopBar = memo<Props & WrappedComponentProps>(
  ({ title, setProjectIds, intl }) => {
    const theme = useTheme();

    return (
      <Container>
        <Title>{title}</Title>

        <ProjectFilterDropdownPositioner>
          <FilterIcon name="filter-2" />
          <ProjectFilterDropdown
            title={intl.formatMessage(messages.filterDropdownTitle)}
            onChange={setProjectIds}
            textColor={theme.colors.tenantText}
          />
        </ProjectFilterDropdownPositioner>
      </Container>
    );
  }
);

export default injectIntl(TopBar);
