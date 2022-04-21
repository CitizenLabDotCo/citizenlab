import React, { useRef, useLayoutEffect } from 'react';

// styles
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

// components
import { Title, Box } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';

// craft
import { useEditor } from '@craftjs/core';
import { ROOT_NODE } from '@craftjs/utils';
import { getComponentNameMessage } from '../RenderNode';

// intl
import messages from '../../messages';
import { FormattedMessage } from 'utils/cl-intl';

const StyledBox = styled(Box)`
  box-shadow: -2px 0px 1px 0px rgba(0, 0, 0, 0.06);
`;

const ContentBuilderSettings = () => {
  // const [topVal, setTopVal] = useState(0);
  const topVal = 90;

  const ref = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    console.log(
      document.getElementById('settings-box')?.getBoundingClientRect()
    );
  });

  const { actions, selected, isEnabled } = useEditor((state, query) => {
    const currentNodeId: string = query.getEvent('selected').last();
    let selected;
    if (currentNodeId) {
      selected = {
        id: currentNodeId,
        name: state.nodes[currentNodeId].data.name,
        settings:
          state.nodes[currentNodeId].related &&
          state.nodes[currentNodeId].related.settings,
        isDeletable: query.node(currentNodeId).isDeletable(),
      };
    }

    return {
      selected,
      isEnabled: state.options.enabled,
    };
  });

  /*   const measuredRef = useCallback((node: HTMLElement) => {
      if (node !== null) {
        setTopVal(node.getBoundingClientRect().height);
  
        // Determine location of Delete button
        let topOffset = 0;
        if (!isNil(node)) {
          topOffset = node.getBoundingClientRect().y;
        }
  
        console.log("NODE:");
        console.log(node);
        console.log("NODE Y VAL:");
        console.log(node.getBoundingClientRect().y);
  
        // Determine view height
        const vh = document.documentElement.clientHeight;
  
        // Determine offset between button and view height (bottom of screen)
        setTopVal(90);
  
        // If button is not visible on the screen, find the correct offset for Top
        if (topOffset > vh) {
          setTopVal((topOffset - vh) * -1);
        }
  
        console.log("vh: %d", vh);
        console.log("TopOffset: %d", topOffset);
        console.log("TopVal: %d", topVal);
      }
    }, [topVal, selected]); */

  return selected && isEnabled && selected.id !== ROOT_NODE ? (
    <StyledBox
      id="settings-box"
      position="sticky"
      top={`${topVal}px`}
      zIndex="2"
      p="20px"
      w="400px"
    >
      <Title mt="70px" variant="h2">
        <FormattedMessage {...getComponentNameMessage(selected.name)} />
      </Title>
      {selected.settings && React.createElement(selected.settings)}
      {selected.isDeletable ? (
        <Box ref={ref} display="flex">
          <Button
            icon="delete"
            buttonStyle="primary-outlined"
            borderColor={colors.clRed}
            textColor={colors.clRed}
            iconColor={colors.clRed}
            onClick={() => {
              actions.delete(selected.id);
            }}
          >
            <FormattedMessage {...messages.delete} />
          </Button>
        </Box>
      ) : null}
    </StyledBox>
  ) : null;
};

export default ContentBuilderSettings;
