import React from 'react';

import {
  bo,
  colors,
  fontSizes,
  invisibleA11yText,
  isRtl,
  quillEditedContent,
} from '@citizenlab/cl2-component-library';
import styled, { css } from 'styled-components';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

export type QuillVariant = 'default' | 'bo';

const boFrameStyle = css`
  && .ql-toolbar.ql-snow {
    padding: 0 4px;
    background: ${colors.grey50};
    border-color: ${colors.grey300};
    border-radius: ${bo.borderRadius} ${bo.borderRadius} 0 0;

    .ql-stroke {
      stroke: ${colors.coolGrey600};
    }

    .ql-fill {
      fill: ${colors.coolGrey600};
    }

    .ql-picker-label {
      font-size: ${fontSizes.xs}px;
      color: ${colors.coolGrey600};
    }
  }

  // createQuill sets an inline border on the container, so these colors need
  // !important to win.
  && div.ql-container {
    border-color: ${colors.grey300} !important;
    border-radius: 0 0 ${bo.borderRadius} ${bo.borderRadius};
  }

  &&.focus .ql-toolbar.ql-snow,
  &&.focus div.ql-container {
    border-color: ${({ theme }) => theme.colors.tenantPrimary} !important;
  }

  && div.ql-container,
  &&.focus div.ql-container {
    border-top-color: ${colors.grey200} !important;
  }

  && div.ql-container > div.ql-editor {
    padding: 9px 11px;

    &,
    p,
    li {
      font-size: ${fontSizes.xs}px;
      color: ${colors.grey800};
    }

    &.ql-blank::before {
      left: 11px;
      right: 11px;
      font-size: ${fontSizes.xs}px;
      font-style: normal;
      color: ${colors.coolGrey500};
    }
  }

  // The frame shows focus; the editor's own focus ring would paint over it.
  &&.focus div.ql-container > div.ql-editor {
    border: none;
    box-shadow: none;
  }
`;

const Container = styled.div<{
  videoPrompt: string;
  linkPrompt: string;
  visitPrompt: string;
  save: string;
  edit: string;
  remove: string;
  maxHeight?: string;
  minHeight?: string;
  variant: QuillVariant;
}>`
  .ql-snow.ql-toolbar button:hover .ql-stroke,
  .ql-snow .ql-toolbar button:hover .ql-stroke,
  .ql-snow.ql-toolbar button:focus .ql-stroke,
  .ql-snow .ql-toolbar button:focus .ql-stroke,
  .ql-snow.ql-toolbar button.ql-active .ql-stroke,
  .ql-snow .ql-toolbar button.ql-active .ql-stroke,
  .ql-snow.ql-toolbar .ql-picker-label:hover .ql-stroke,
  .ql-snow .ql-toolbar .ql-picker-label:hover .ql-stroke,
  .ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-stroke,
  .ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-stroke,
  .ql-snow.ql-toolbar .ql-picker-item:hover .ql-stroke,
  .ql-snow .ql-toolbar .ql-picker-item:hover .ql-stroke,
  .ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-stroke,
  .ql-snow .ql-toolbar .ql-picker-item.ql-selected .ql-stroke,
  .ql-snow.ql-toolbar button:hover .ql-stroke-miter,
  .ql-snow .ql-toolbar button:hover .ql-stroke-miter,
  .ql-snow.ql-toolbar button:focus .ql-stroke-miter,
  .ql-snow .ql-toolbar button:focus .ql-stroke-miter,
  .ql-snow.ql-toolbar button.ql-active .ql-stroke-miter,
  .ql-snow .ql-toolbar button.ql-active .ql-stroke-miter,
  .ql-snow.ql-toolbar .ql-picker-label:hover .ql-stroke-miter,
  .ql-snow .ql-toolbar .ql-picker-label:hover .ql-stroke-miter,
  .ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-stroke-miter,
  .ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-stroke-miter,
  .ql-snow.ql-toolbar .ql-picker-item:hover .ql-stroke-miter,
  .ql-snow .ql-toolbar .ql-picker-item:hover .ql-stroke-miter,
  .ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-stroke-miter,
  .ql-snow .ql-toolbar .ql-picker-item.ql-selected .ql-stroke-miter,
  .ql-picker-label:focus .ql-stroke,
  .ql-picker-item:focus .ql-stroke {
    stroke: ${colors.teal};
  }

  .ql-snow.ql-toolbar button:hover .ql-fill,
  .ql-snow .ql-toolbar button:hover .ql-fill,
  .ql-snow.ql-toolbar button:focus .ql-fill,
  .ql-snow .ql-toolbar button:focus .ql-fill,
  .ql-snow.ql-toolbar button.ql-active .ql-fill,
  .ql-snow .ql-toolbar button.ql-active .ql-fill,
  .ql-snow.ql-toolbar .ql-picker-label:hover .ql-fill,
  .ql-snow .ql-toolbar .ql-picker-label:hover .ql-fill,
  .ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-fill,
  .ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-fill,
  .ql-snow.ql-toolbar .ql-picker-item:hover .ql-fill,
  .ql-snow .ql-toolbar .ql-picker-item:hover .ql-fill,
  .ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-fill,
  .ql-snow .ql-toolbar .ql-picker-item.ql-selected .ql-fill,
  .ql-snow.ql-toolbar button:hover .ql-stroke.ql-fill,
  .ql-snow .ql-toolbar button:hover .ql-stroke.ql-fill,
  .ql-snow.ql-toolbar button:focus .ql-stroke.ql-fill,
  .ql-snow .ql-toolbar button:focus .ql-stroke.ql-fill,
  .ql-snow.ql-toolbar button.ql-active .ql-stroke.ql-fill,
  .ql-snow .ql-toolbar button.ql-active .ql-stroke.ql-fill,
  .ql-snow.ql-toolbar .ql-picker-label:hover .ql-stroke.ql-fill,
  .ql-snow .ql-toolbar .ql-picker-label:hover .ql-stroke.ql-fill,
  .ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-stroke.ql-fill,
  .ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-stroke.ql-fill,
  .ql-snow.ql-toolbar .ql-picker-item:hover .ql-stroke.ql-fill,
  .ql-snow .ql-toolbar .ql-picker-item:hover .ql-stroke.ql-fill,
  .ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-stroke.ql-fill,
  .ql-snow .ql-toolbar .ql-picker-item.ql-selected .ql-stroke.ql-fill,
  .ql-snow.ql-toolbar .ql-picker-label:focus .ql-stroke.ql-fill,
  .ql-snow.ql-toolbar .ql-picker-item:focus .ql-stroke.ql-fill {
    fill: ${colors.teal};
  }

  .ql-snow.ql-toolbar button:hover,
  .ql-snow .ql-toolbar button:hover,
  .ql-snow.ql-toolbar button:focus,
  .ql-snow .ql-toolbar button:focus,
  .ql-snow.ql-toolbar button.ql-active,
  .ql-snow .ql-toolbar button.ql-active,
  .ql-snow.ql-toolbar .ql-picker-label:hover,
  .ql-snow.ql-toolbar .ql-picker-label:focus,
  .ql-snow .ql-toolbar .ql-picker-label:hover,
  .ql-snow.ql-toolbar .ql-picker-label.ql-active,
  .ql-snow .ql-toolbar .ql-picker-label.ql-active,
  .ql-snow .ql-toolbar .ql-picker-label:focus,
  .ql-snow.ql-toolbar .ql-picker-item:hover,
  .ql-snow .ql-toolbar .ql-picker-item:hover,
  .ql-snow.ql-toolbar .ql-picker-item.ql-selected,
  .ql-snow.ql-toolbar .ql-picker-item:focus,
  .ql-snow .ql-toolbar .ql-picker-item.ql-selected {
    color: ${colors.teal};
  }

  .ql-tooltip {
    left: 0 !important;
  }

  .ql-tooltip[data-mode='link']::before {
    content: '${(props) => props.linkPrompt}' !important;
  }

  .ql-tooltip[data-mode='video']::before {
    content: '${(props) => props.videoPrompt}' !important;
  }

  .ql-tooltip::before {
    content: '${(props) => props.visitPrompt}' !important;
  }

  .ql-tooltip.ql-editing a.ql-action::after {
    content: '${(props) => props.save}' !important;
  }

  .ql-tooltip a.ql-action::after {
    content: '${(props) => props.edit}' !important;
  }

  .ql-tooltip a.ql-remove::before {
    content: '${(props) => props.remove}' !important;
  }

  .ql-tooltip.ql-editing input {
    font-size: 16px !important;
    font-weight: 400 !important;
  }

  span.ql-formats:last-child {
    margin-right: 0;
  }

  .ql-toolbar.ql-snow {
    background: #f8f8f8;
    border-radius: ${({ theme }) => theme.borderRadius}
      ${({ theme }) => theme.borderRadius} 0 0;
    box-shadow: none;
    border: 1px solid ${colors.borderDark};
    border-bottom: 0;
    transition: box-shadow 100ms ease-out;
  }

  div.ql-container {
    border: 1px solid ${colors.borderDark};
  }

  div.ql-container > div.ql-editor {
    min-height: ${(props) => props.minHeight ?? '300px'};
    max-height: ${({ maxHeight, theme }) =>
      maxHeight ?? `calc(80vh - ${theme.menuHeight}px)`};
    cursor: text;
    ${(props) => quillEditedContent(props.theme.colors.tenantPrimary)};

    ${isRtl`
      direction: rtl;
      text-align: right;
    `}
  }

  &.focus div.ql-container > div.ql-editor {
    border: 2px solid ${(props) => props.theme.colors.tenantPrimary};
  }

  /* add text label for icon toolbar visible when CSS is
     off so the controls remain meaningful. */
  .ql-sr-only {
    ${invisibleA11yText()}
  }

  ${({ variant }) => variant === 'bo' && boFrameStyle}
`;

interface Props {
  maxHeight?: string;
  minHeight?: string;
  className: string;
  variant?: QuillVariant;
  children: React.ReactNode;
  onMouseLeave: React.MouseEventHandler<HTMLDivElement>;
}

const StyleContainer = ({
  maxHeight,
  minHeight,
  className,
  variant = 'default',
  children,
  onMouseLeave,
}: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Container
      maxHeight={maxHeight}
      minHeight={minHeight}
      className={className}
      variant={variant}
      videoPrompt={formatMessage(messages.videoPrompt)}
      linkPrompt={formatMessage(messages.linkPrompt)}
      visitPrompt={formatMessage(messages.visitPrompt)}
      save={formatMessage(messages.save)}
      edit={formatMessage(messages.edit)}
      remove={formatMessage(messages.remove)}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </Container>
  );
};

export default StyleContainer;
