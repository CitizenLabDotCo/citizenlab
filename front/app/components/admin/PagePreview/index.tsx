import React from 'react';

import { Box, Button, colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import PhonePreview from 'components/admin/PhonePreview';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

const Preview = styled(PhonePreview)`
  transition: transform 150ms ease-out, box-shadow 150ms ease-out;

  &:hover,
  &:focus-within {
    transform: translateY(-2px);
    box-shadow: 0 0 0 3px rgba(44, 110, 125, 0.42),
      0 18px 42px rgba(20, 25, 40, 0.16);
  }
`;

const CornerEditButton = styled(Button)`
  transition: opacity 140ms ease-out;

  ${Preview}:hover &,
  ${Preview}:focus-within & {
    opacity: 0;
    pointer-events: none;
  }
`;

const Overlay = styled(Box)`
  transition: opacity 160ms ease-out, visibility 160ms ease-out;

  ${Preview}:hover &,
  ${Preview}:focus-within & {
    opacity: 1;
    visibility: visible;
  }
`;

const CtaWrapper = styled(Box)`
  transition: transform 160ms ease-out;

  ${Preview}:hover &,
  ${Preview}:focus-within & {
    transform: translateY(0);
  }
`;

type Props = {
  src: string;
  iframeTitle: string;
  editPageContentAriaLabel: string;
  editPageContentText?: string;
  onEdit: () => void;
  dataCy?: string;
  editPageContentClassName?: string;
  alignTop?: boolean;
};

// A phone preview of a page with buttons that open its content builder.
const PagePreview = ({
  src,
  iframeTitle,
  editPageContentAriaLabel,
  editPageContentText,
  onEdit,
  dataCy,
  editPageContentClassName,
  alignTop,
}: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Preview src={src} title={iframeTitle} dataCy={dataCy} alignTop={alignTop}>
      <CornerEditButton
        position="absolute"
        top="12px"
        right="12px"
        buttonStyle="primary"
        size="s"
        icon="edit"
        iconSize="16px"
        borderColor={colors.grey300}
        borderRadius="6px"
        padding="4px 10px"
        fontSize="12px"
        onClick={onEdit}
        text={formatMessage(messages.edit)}
      />
      <Overlay
        position="absolute"
        top="0"
        right="0"
        bottom="0"
        left="0"
        display="flex"
        alignItems="center"
        justifyContent="center"
        background="rgba(18, 38, 44, 0.3)"
        opacity={0}
        visibility="hidden"
        // Let wheel/scroll fall through to the iframe so the preview stays scrollable
        pointerEvents="none"
      >
        <CtaWrapper
          className={editPageContentClassName}
          pointerEvents="auto"
          transform="translateY(7px)"
        >
          <Button
            icon="edit"
            buttonStyle="primary"
            onClick={onEdit}
            ariaLabel={editPageContentAriaLabel}
            dataCy="e2e-edit-page-content"
            text={
              editPageContentText ?? formatMessage(messages.editPageContent)
            }
          />
        </CtaWrapper>
      </Overlay>
    </Preview>
  );
};

export default PagePreview;
