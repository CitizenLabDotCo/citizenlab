import React from 'react';

// components
import {
  Box,
  Radio,
  Icon,
  Label,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';

// styles
import styled from 'styled-components';

// utils
import { colors, media } from 'utils/styleUtils';

// craft
import { useNode, Element, ROOT_NODE } from '@craftjs/core';
import Container from 'components/admin/ContentBuilder/Widgets/Container';

// intl
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// typings
import { ColumnLayout } from 'components/admin/ContentBuilder/typings';

type TwoColumnProps = {
  columnLayout: ColumnLayout;
  children?: React.ReactNode;
  isHomepage?: boolean;
};

const StyledBox = styled(Box)`
  min-height: 40px;
  width: 100%;
  gap: 24px;
  display: grid;
  max-width: 1150px;
  margin: 0 auto;

  ${media.tablet`
    grid-template-columns: 1fr;
  `}

  grid-template-columns: ${(props: TwoColumnProps) =>
    props.columnLayout === '1-1'
      ? '1fr 1fr'
      : props.columnLayout === '2-1'
      ? '2fr 1fr'
      : '1fr 2fr'};
`;

export const TwoColumn = ({
  columnLayout,
  children,
  isHomepage,
}: TwoColumnProps) => {
  const isSmallerThanTablet = useBreakpoint('tablet');
  const { parent } = useNode((node) => ({
    parent: node.data.parent,
  }));

  return (
    <StyledBox
      id="e2e-two-column"
      columnLayout={columnLayout}
      px={
        isHomepage && isSmallerThanTablet && parent === ROOT_NODE
          ? '20px'
          : '0px'
      }
    >
      {children || (
        <>
          <Element id={'left'} is={Container} canvas />
          <Element id={'right'} is={Container} canvas />
        </>
      )}
    </StyledBox>
  );
};

export const TwoColumnSettings = () => {
  const {
    actions: { setProp },
    columnLayout,
  } = useNode((node) => ({
    columnLayout: node.data.props.columnLayout,
  }));

  return (
    <Box mb="30px">
      <Label>
        <FormattedMessage {...messages.columnLayoutRadioLabel} />
      </Label>
      <Radio
        onChange={(value) => {
          setProp((props: TwoColumnProps) => (props.columnLayout = value));
        }}
        id="layout-1-1"
        name="columnLayout"
        value={'1-1'}
        label={
          <Icon
            title={<FormattedMessage {...messages.twoEvenColumn} />}
            ariaHidden={false}
            width="20px"
            height="20px"
            fill={colors.primary}
            name="layout-2column-1"
          />
        }
        isRequired
        currentValue={columnLayout}
      />
      <Radio
        onChange={(value) => {
          setProp((props: TwoColumnProps) => (props.columnLayout = value));
        }}
        currentValue={columnLayout}
        id="layout-2-1"
        name="columnLayout"
        value="2-1"
        label={
          <Icon
            title={<FormattedMessage {...messages.twoColumnVariant2and1} />}
            ariaHidden={false}
            width="20px"
            height="20px"
            fill={colors.primary}
            name="layout-2column-3"
          />
        }
        isRequired
      />
      <Radio
        onChange={(value) => {
          setProp((props: TwoColumnProps) => (props.columnLayout = value));
        }}
        currentValue={columnLayout}
        id="layout-1-2"
        name="columnLayout"
        value="1-2"
        label={
          <Icon
            title={<FormattedMessage {...messages.twoColumnVariant1and2} />}
            ariaHidden={false}
            width="20px"
            height="20px"
            fill={colors.primary}
            name="layout-2column-2"
          />
        }
        isRequired
      />
    </Box>
  );
};

TwoColumn.craft = {
  props: {
    columnLayout: '',
  },
  related: {
    settings: TwoColumnSettings,
  },
  custom: {
    title: messages.twoColumn,
    hasChildren: true,
  },
};

export default TwoColumn;
