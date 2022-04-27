import React from 'react';

// hooks
import useLocalize from 'hooks/useLocalize';

// components
import { Box, Title } from '@citizenlab/cl2-component-library';
import ReportExportMenu from 'components/admin/ReportExportMenu';

// typings
import { Multiloc } from 'typings';

interface Props {
  titleMultiloc: Multiloc;
  svgNode: React.RefObject<SVGElement | undefined>;
}

const Header = ({ titleMultiloc, svgNode }: Props) => {
  const localize = useLocalize();
  const title = localize(titleMultiloc);

  return (
    <Box p="20px 40px 0px 40px" display="flex" justifyContent="space-between">
      <Title variant="h3" as="h2">
        {title}
      </Title>
      <Box display="flex" alignItems="center">
        <ReportExportMenu name={title} svgNode={svgNode} />
      </Box>
    </Box>
  );
};

export default Header;
