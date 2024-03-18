import React from 'react';

import { render, screen } from '../../utils/testUtils/rtl';

import Box from '.';

describe('<Box />', () => {
  it('renders', () => {
    render(<Box>Test box</Box>);
    expect(screen.getByText('Test box')).toBeInTheDocument();
  });
  describe('Box color props', () => {
    it('applies color', () => {
      render(<Box color="green">Test box</Box>);
      expect(screen.getByText('Test box')).toHaveStyle({
        color: 'green',
      });
    });
    it('applies bgColor', () => {
      render(<Box bgColor="green">Test box</Box>);
      expect(screen.getByText('Test box')).toHaveStyle({
        backgroundColor: 'green',
      });
    });
    it('applies opacity', () => {
      render(<Box opacity={0.5}>Test box</Box>);
      expect(screen.getByText('Test box')).toHaveStyle({
        opacity: '0.5',
      });
    });
  });
  describe('Box background props', () => {
    it('applies background', () => {
      render(<Box background="red">Test box</Box>);
      expect(screen.getByText('Test box')).toHaveStyle({
        background: 'red',
      });
    });
    it('applies bg', () => {
      render(<Box bg="red">Test box</Box>);
      expect(screen.getByText('Test box')).toHaveStyle({
        background: 'red',
      });
    });
  });
  describe('Box padding props', () => {
    it('applies pb', () => {
      render(<Box pb="12px">Test box</Box>);
      expect(screen.getByText('Test box')).toHaveStyle({
        paddingBottom: '12px',
      });
    });
    it('applies paddingBottom', () => {
      render(<Box paddingBottom="12px">Test box</Box>);
      expect(screen.getByText('Test box')).toHaveStyle({
        paddingBottom: '12px',
      });
    });
    it('applies pt', () => {
      render(<Box pt="12px">Test box</Box>);
      expect(screen.getByText('Test box')).toHaveStyle({ paddingTop: '12px' });
    });
    it('applies paddingTop', () => {
      render(<Box paddingTop="12px">Test box</Box>);
      expect(screen.getByText('Test box')).toHaveStyle({ paddingTop: '12px' });
    });
    it('applies pl', () => {
      render(<Box pl="12px">Test box</Box>);
      expect(screen.getByText('Test box')).toHaveStyle({ paddingLeft: '12px' });
    });
    it('applies paddingLeft', () => {
      render(<Box paddingLeft="12px">Test box</Box>);
      expect(screen.getByText('Test box')).toHaveStyle({ paddingLeft: '12px' });
    });
    it('applies pr', () => {
      render(<Box pr="12px">Test box</Box>);
      expect(screen.getByText('Test box')).toHaveStyle({
        paddingRight: '12px',
      });
    });
    it('applies paddingRight', () => {
      render(<Box paddingRight="12px">Test box</Box>);
      expect(screen.getByText('Test box')).toHaveStyle({
        paddingRight: '12px',
      });
    });
    it('applies px', () => {
      render(<Box px="12px">Test box</Box>);
      expect(screen.getByText('Test box')).toHaveStyle({
        paddingRight: '12px',
        paddingLeft: '12px',
      });
    });
    it('applies paddingX', () => {
      render(<Box paddingX="12px">Test box</Box>);
      expect(screen.getByText('Test box')).toHaveStyle({
        paddingRight: '12px',
        paddingLeft: '12px',
      });
    });
    it('applies py', () => {
      render(<Box py="12px">Test box</Box>);
      expect(screen.getByText('Test box')).toHaveStyle({
        paddingTop: '12px',
        paddingBottom: '12px',
      });
    });
    it('applies paddingY', () => {
      render(<Box paddingY="12px">Test box</Box>);
      expect(screen.getByText('Test box')).toHaveStyle({
        paddingTop: '12px',
        paddingBottom: '12px',
      });
    });
  });
  describe('Box margin props', () => {
    it('applies mb', () => {
      render(<Box mb="12px">Test box</Box>);
      expect(screen.getByText('Test box')).toHaveStyle({
        marginBottom: '12px',
      });
    });
    it('applies marginBottom', () => {
      render(<Box marginBottom="12px">Test box</Box>);
      expect(screen.getByText('Test box')).toHaveStyle({
        marginBottom: '12px',
      });
    });
    it('applies mt', () => {
      render(<Box mt="12px">Test box</Box>);
      expect(screen.getByText('Test box')).toHaveStyle({ marginTop: '12px' });
    });
    it('applies marginTop', () => {
      render(<Box marginTop="12px">Test box</Box>);
      expect(screen.getByText('Test box')).toHaveStyle({ marginTop: '12px' });
    });
    it('applies ml', () => {
      render(<Box ml="12px">Test box</Box>);
      expect(screen.getByText('Test box')).toHaveStyle({ marginLeft: '12px' });
    });
    it('applies marginLeft', () => {
      render(<Box marginLeft="12px">Test box</Box>);
      expect(screen.getByText('Test box')).toHaveStyle({ marginLeft: '12px' });
    });
    it('applies mr', () => {
      render(<Box mr="12px">Test box</Box>);
      expect(screen.getByText('Test box')).toHaveStyle({ marginRight: '12px' });
    });
    it('applies marginRight', () => {
      render(<Box marginRight="12px">Test box</Box>);
      expect(screen.getByText('Test box')).toHaveStyle({ marginRight: '12px' });
    });
    it('applies mx', () => {
      render(<Box mx="12px">Test box</Box>);
      expect(screen.getByText('Test box')).toHaveStyle({
        marginRight: '12px',
        marginLeft: '12px',
      });
    });
    it('applies marginX', () => {
      render(<Box marginX="12px">Test box</Box>);
      expect(screen.getByText('Test box')).toHaveStyle({
        marginRight: '12px',
        marginLeft: '12px',
      });
    });
    it('applies my', () => {
      render(<Box my="12px">Test box</Box>);
      expect(screen.getByText('Test box')).toHaveStyle({
        marginTop: '12px',
        marginBottom: '12px',
      });
    });
    it('applies marginY', () => {
      render(<Box marginY="12px">Test box</Box>);
      expect(screen.getByText('Test box')).toHaveStyle({
        marginTop: '12px',
        marginBottom: '12px',
      });
    });
  });
  describe('Box height props', () => {
    it('applies h', () => {
      render(<Box h="12px">Test box</Box>);
      expect(screen.getByText('Test box')).toHaveStyle({
        height: '12px',
      });
    });
    it('applies height', () => {
      render(<Box height="12px">Test box</Box>);
      expect(screen.getByText('Test box')).toHaveStyle({
        height: '12px',
      });
    });
    it('applies maxHeight', () => {
      render(<Box maxHeight="12px">Test box</Box>);
      expect(screen.getByText('Test box')).toHaveStyle({
        maxHeight: '12px',
      });
    });
    it('applies minHeight', () => {
      render(<Box minHeight="12px">Test box</Box>);
      expect(screen.getByText('Test box')).toHaveStyle({
        minHeight: '12px',
      });
    });
  });
  describe('Box width props', () => {
    it('applies w', () => {
      render(<Box w="12px">Test box</Box>);
      expect(screen.getByText('Test box')).toHaveStyle({
        width: '12px',
      });
    });
    it('applies width', () => {
      render(<Box width="12px">Test box</Box>);
      expect(screen.getByText('Test box')).toHaveStyle({
        width: '12px',
      });
    });
    it('applies maxwidth', () => {
      render(<Box maxWidth="12px">Test box</Box>);
      expect(screen.getByText('Test box')).toHaveStyle({
        maxWidth: '12px',
      });
    });
    it('applies minwidth', () => {
      render(<Box minWidth="12px">Test box</Box>);
      expect(screen.getByText('Test box')).toHaveStyle({
        minWidth: '12px',
      });
    });
  });
  describe('Box display props', () => {
    it('applies display:flex', () => {
      render(<Box display="flex">Test box</Box>);
      expect(screen.getByText('Test box')).toHaveStyle({
        display: 'flex',
      });
    });
    it('applies display:none', () => {
      render(<Box display="none">Test box</Box>);
      expect(screen.getByText('Test box')).toHaveStyle({
        display: 'none',
      });
    });
    it('applies display:block', () => {
      render(<Box display="block">Test box</Box>);
      expect(screen.getByText('Test box')).toHaveStyle({
        display: 'block',
      });
    });
  });
  describe('Box overflow props', () => {
    it('applies overflow', () => {
      render(<Box overflow="scroll">Test box</Box>);
      expect(screen.getByText('Test box')).toHaveStyle({
        overflow: 'scroll',
      });
    });
    it('applies overflowY', () => {
      render(<Box overflowY="auto">Test box</Box>);
      expect(screen.getByText('Test box')).toHaveStyle({
        overflowY: 'auto',
      });
    });
    it('applies overflowX', () => {
      render(<Box overflowX="auto">Test box</Box>);
      expect(screen.getByText('Test box')).toHaveStyle({
        overflowX: 'auto',
      });
    });
  });
  describe('Box position props', () => {
    it('applies position:absolute', () => {
      render(<Box position="absolute">Test box</Box>);
      expect(screen.getByText('Test box')).toHaveStyle({
        position: 'absolute',
      });
    });
    it('applies position:relative', () => {
      render(<Box position="relative">Test box</Box>);
      expect(screen.getByText('Test box')).toHaveStyle({
        position: 'relative',
      });
    });
    it('applies top', () => {
      render(<Box top="12px">Test box</Box>);
      expect(screen.getByText('Test box')).toHaveStyle({
        top: '12px',
      });
    });
    it('applies bottom', () => {
      render(<Box bottom="12px">Test box</Box>);
      expect(screen.getByText('Test box')).toHaveStyle({
        bottom: '12px',
      });
    });
    it('applies left', () => {
      render(<Box left="12px">Test box</Box>);
      expect(screen.getByText('Test box')).toHaveStyle({
        left: '12px',
      });
    });
    it('applies right', () => {
      render(<Box right="12px">Test box</Box>);
      expect(screen.getByText('Test box')).toHaveStyle({
        right: '12px',
      });
    });
  });
  describe('Box flex props', () => {
    it('applies flexDirection:column', () => {
      render(<Box flexDirection="column">Test box</Box>);
      expect(screen.getByText('Test box')).toHaveStyle({
        flexDirection: 'column',
      });
    });
    it('applies flexDirection:row', () => {
      render(<Box flexDirection="row">Test box</Box>);
      expect(screen.getByText('Test box')).toHaveStyle({
        flexDirection: 'row',
      });
    });
    it('applies flexWrap:wrap', () => {
      render(<Box flexWrap="wrap">Test box</Box>);
      expect(screen.getByText('Test box')).toHaveStyle({
        flexWrap: 'wrap',
      });
    });
    it('applies alignItems:center', () => {
      render(<Box alignItems="center">Test box</Box>);
      expect(screen.getByText('Test box')).toHaveStyle({
        alignItems: 'center',
      });
    });
    it('applies justifyContent:center', () => {
      render(<Box justifyContent="center">Test box</Box>);
      expect(screen.getByText('Test box')).toHaveStyle({
        justifyContent: 'center',
      });
    });
    it('applies alignContent:center', () => {
      render(<Box alignContent="center">Test box</Box>);
      expect(screen.getByText('Test box')).toHaveStyle({
        alignContent: 'center',
      });
    });
    it('applies order', () => {
      render(<Box order={1}>Test box</Box>);
      expect(screen.getByText('Test box')).toHaveStyle({
        order: '1',
      });
    });
    it('applies flexGrow', () => {
      render(<Box flexGrow={1}>Test box</Box>);
      expect(screen.getByText('Test box')).toHaveStyle({
        flexGrow: '1',
      });
    });
    it('applies flexShrink', () => {
      render(<Box flexShrink={1}>Test box</Box>);
      expect(screen.getByText('Test box')).toHaveStyle({
        flexShrink: '1',
      });
    });
    it('applies flexBasis', () => {
      render(<Box flexBasis={1}>Test box</Box>);
      expect(screen.getByText('Test box')).toHaveStyle({
        flexBasis: '1',
      });
    });
    it('applies flex', () => {
      render(<Box flex="1 0 auto">Test box</Box>);
      expect(screen.getByText('Test box')).toHaveStyle({
        flex: '1 0 auto',
      });
    });
    it('applies alignSelf', () => {
      render(<Box alignSelf="flex-end">Test box</Box>);
      expect(screen.getByText('Test box')).toHaveStyle({
        alignSelf: 'flex-end',
      });
    });
    it('applies gap', () => {
      render(<Box gap="20px">Test box</Box>);
      expect(screen.getByText('Test box')).toHaveStyle({
        gap: '20px',
      });
    });
  });
  describe('Box border props', () => {
    it('applies border', () => {
      render(<Box border="1px solid red">Test box</Box>);
      expect(screen.getByText('Test box')).toHaveStyle({
        border: '1px solid red',
      });
    });
    it('applies borderTop', () => {
      render(<Box borderTop="1px solid red">Test box</Box>);
      expect(screen.getByText('Test box')).toHaveStyle({
        borderTop: '1px solid red',
      });
    });
    it('applies borderBottom', () => {
      render(<Box borderBottom="1px solid red">Test box</Box>);
      expect(screen.getByText('Test box')).toHaveStyle({
        borderBottom: '1px solid red',
      });
    });
    it('applies borderLeft', () => {
      render(<Box borderLeft="1px solid red">Test box</Box>);
      expect(screen.getByText('Test box')).toHaveStyle({
        borderLeft: '1px solid red',
      });
    });
    it('applies borderRight', () => {
      render(<Box borderRight="1px solid red">Test box</Box>);
      expect(screen.getByText('Test box')).toHaveStyle({
        borderRight: '1px solid red',
      });
    });
    it('applies borderColor', () => {
      render(<Box borderColor="red">Test box</Box>);
      expect(screen.getByText('Test box')).toHaveStyle({
        borderColor: 'red',
      });
    });
    it('applies borderWidth', () => {
      render(<Box borderWidth="12px">Test box</Box>);
      expect(screen.getByText('Test box')).toHaveStyle({
        borderWidth: '12px',
      });
    });
    it('applies borderRadius', () => {
      render(<Box borderRadius="12px">Test box</Box>);
      expect(screen.getByText('Test box')).toHaveStyle({
        borderRadius: '12px',
      });
    });
    it('applies borderStyle', () => {
      render(<Box borderStyle="solid">Test box</Box>);
      expect(screen.getByText('Test box')).toHaveStyle({
        borderStyle: 'solid',
      });
    });
  });
  describe('Box visibility props', () => {
    it('applies visibility:hidden', () => {
      render(<Box visibility="hidden">Test box</Box>);
      expect(screen.getByText('Test box')).toHaveStyle({
        visibility: 'hidden',
      });
    });
    it('applies visibility:visible', () => {
      render(<Box visibility="visible">Test box</Box>);
      expect(screen.getByText('Test box')).toHaveStyle({
        visibility: 'visible',
      });
    });
  });
  describe('Box shadow props', () => {
    it('applies boxShadow', () => {
      render(<Box boxShadow="5px 10px black">Test box</Box>);
      expect(screen.getByText('Test box')).toHaveStyle({
        boxShadow: '5px 10px black',
      });
    });
  });
  describe('Box zIndex props', () => {
    it('applies zIndex', () => {
      render(<Box zIndex="9999">Test box</Box>);
      expect(screen.getByText('Test box')).toHaveStyle({
        zIndex: '9999',
      });
    });
  });
});
