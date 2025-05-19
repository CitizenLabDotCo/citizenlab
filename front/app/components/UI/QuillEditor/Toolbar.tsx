import React, { useCallback } from 'react';

import { Tooltip, colors, fontSizes } from '@citizenlab/cl2-component-library';
import Quill from 'quill';
import styled from 'styled-components';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import tracks from './tracks';

const DropdownList = styled.div`
  display: flex;
  flex-direction: column;
  width: auto;
  margin-top: 5px;
  margin-bottom: 5px;
`;

const DropdownListItem = styled.button`
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: ${colors.textPrimary};
  font-size: ${fontSizes.s}px;
  font-weight: 400;
  white-space: nowrap;
  width: auto !important;
  padding: 10px;
  border-radius: ${(props) => props.theme.borderRadius};
  cursor: pointer;
  white-space: nowrap;
  text-align: left;

  &:hover,
  &:focus {
    outline: none;
    color: white;
    background: ${colors.background};
  }
`;

interface Props {
  id: string;
  limitedTextFormatting?: boolean;
  withCTAButton?: boolean;
  isButtonsMenuVisible: boolean;
  noImages: boolean;
  noVideos: boolean;
  noAlign: boolean;
  noLinks: boolean;
  editor: Quill | null;
  setIsButtonsMenuVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

const Toolbar = ({
  id,
  limitedTextFormatting,
  withCTAButton,
  isButtonsMenuVisible,
  noImages,
  noVideos,
  noAlign,
  noLinks,
  editor,
  setIsButtonsMenuVisible,
}: Props) => {
  const { formatMessage } = useIntl();

  const handleCustomLink = useCallback(() => {
    if (!editor) return;
    const selection = editor.getSelection();

    if (selection && selection.length > 0) {
      const value = prompt(formatMessage(messages.customLinkPrompt));
      editor.format('button', value);
      setIsButtonsMenuVisible(false);
    }
  }, [editor, setIsButtonsMenuVisible, formatMessage]);

  const handleNormalLink = useCallback(() => {
    if (!editor) return;
    const selection = editor.getSelection();

    // copied from the snow toolbar code
    // to manually add the handler that would have been callen on the toolbar button
    if (selection == null || selection.length === 0) return;
    const preview = editor.getText(selection as any);
    const tooltip = (editor as any).theme.tooltip;
    tooltip.edit('link', preview);
    setIsButtonsMenuVisible(false);
  }, [editor, setIsButtonsMenuVisible]);

  const toggleButtonsMenu = useCallback(
    () => setIsButtonsMenuVisible((value) => !value),
    [setIsButtonsMenuVisible]
  );
  const hideButtonsMenu = useCallback(
    () => setIsButtonsMenuVisible(false),
    [setIsButtonsMenuVisible]
  );

  const trackAdvanced =
    ({
      type,
      option,
    }:
      | { type: 'align'; option: 'left' | 'center' | 'right' }
      | { type: 'list'; option: 'bullet' | 'ordered' }) =>
    (_event: React.MouseEvent<HTMLElement>) => {
      trackEventByName(tracks.advancedEditing, {
        type,
        option,
      });
    };

  const trackClickDropdown = (event: React.MouseEvent<HTMLElement>) => {
    if (
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      event.currentTarget &&
      event.currentTarget.classList.contains('ql-picker-item')
    ) {
      const value = event.currentTarget.getAttribute('data-value');
      let option: string;

      if (value === '1') {
        option = 'title';
      } else if (value === '2') {
        option = 'subtitle';
      } else {
        option = 'normal';
      }

      trackEventByName(tracks.advancedEditing, {
        option,
        type: 'heading',
      });
    }
  };

  const trackBasic =
    (type: 'bold' | 'italic' | 'custom-link' | 'link') =>
    (_event: React.MouseEvent<HTMLElement>) => {
      trackEventByName(tracks.basicEditing, {
        type,
      });
    };

  const trackImage = (_event: React.MouseEvent<HTMLElement>) => {
    trackEventByName(tracks.imageEditing);
  };

  const trackVideo = (_event: React.MouseEvent<HTMLElement>) => {
    trackEventByName(tracks.videoEditing);
  };

  return (
    <div id={id}>
      {!limitedTextFormatting && (
        <span className="ql-formats" role="button" onClick={trackClickDropdown}>
          <select className="ql-header" defaultValue={''}>
            <option value="2" aria-selected={false}>
              {formatMessage(messages.title)}
            </option>
            <option value="3" aria-selected={false}>
              {formatMessage(messages.subtitle)}
            </option>
            <option value="" aria-selected>
              {formatMessage(messages.normalText)}
            </option>
          </select>
        </span>
      )}
      <span className="ql-formats">
        <button
          className="ql-bold"
          onClick={trackBasic('bold')}
          aria-label={formatMessage(messages.bold)}
        />
        <button
          className="ql-italic"
          onClick={trackBasic('italic')}
          aria-label={formatMessage(messages.italic)}
        />
        {!noLinks && (
          <>
            {withCTAButton ? (
              <Tooltip
                placement="bottom"
                theme="light"
                visible={isButtonsMenuVisible}
                onClickOutside={hideButtonsMenu}
                duration={[200, 0]}
                content={
                  <DropdownList>
                    <DropdownListItem onClick={handleCustomLink} type="button">
                      {formatMessage(messages.customLink)}
                    </DropdownListItem>
                    <DropdownListItem
                      onClick={handleNormalLink}
                      type="button"
                      className="ql-link"
                    >
                      {formatMessage(messages.link)}
                    </DropdownListItem>
                  </DropdownList>
                }
              >
                <button type="button" onClick={toggleButtonsMenu}>
                  <svg viewBox="0 0 18 18">
                    <line className="ql-stroke" x1="7" x2="11" y1="7" y2="11" />
                    <path
                      className="ql-even ql-stroke"
                      d="M8.9,4.577a3.476,3.476,0,0,1,.36,4.679A3.476,3.476,0,0,1,4.577,8.9C3.185,7.5,2.035,6.4,4.217,4.217S7.5,3.185,8.9,4.577Z"
                    />
                    <path
                      className="ql-even ql-stroke"
                      d="M13.423,9.1a3.476,3.476,0,0,0-4.679-.36,3.476,3.476,0,0,0,.36,4.679c1.392,1.392,2.5,2.542,4.679.36S14.815,10.5,13.423,9.1Z"
                    />
                  </svg>
                </button>
              </Tooltip>
            ) : (
              <button
                className="ql-link"
                onClick={trackBasic('link')}
                aria-label={formatMessage(messages.link)}
              />
            )}
          </>
        )}
      </span>

      {!limitedTextFormatting && !noAlign && (
        <span className="ql-formats">
          <button
            className="ql-align"
            value=""
            onClick={trackAdvanced({ type: 'align', option: 'left' })}
            aria-label={formatMessage(messages.alignLeft)}
          />
          <button
            className="ql-align"
            value="center"
            onClick={trackAdvanced({ type: 'align', option: 'center' })}
            aria-label={formatMessage(messages.alignCenter)}
          />
          <button
            className="ql-align"
            value="right"
            onClick={trackAdvanced({ type: 'align', option: 'right' })}
            aria-label={formatMessage(messages.alignRight)}
          />
        </span>
      )}

      {!limitedTextFormatting && (
        <span className="ql-formats">
          <button
            className="ql-list"
            value="ordered"
            onClick={trackAdvanced({ type: 'list', option: 'ordered' })}
            aria-label={formatMessage(messages.orderedList)}
          />
          <button
            className="ql-list"
            value="bullet"
            onClick={trackAdvanced({ type: 'list', option: 'bullet' })}
            aria-label={formatMessage(messages.unorderedList)}
          />
        </span>
      )}

      {!(noImages && noVideos) && (
        <span className="ql-formats">
          {!noImages && (
            <button
              className="ql-image"
              onClick={trackImage}
              aria-label={formatMessage(messages.image)}
            />
          )}
          {!noVideos && (
            <button
              className="ql-video"
              onClick={trackVideo}
              aria-label={formatMessage(messages.video)}
            />
          )}
        </span>
      )}

      <span className="ql-formats">
        <button
          className="ql-clean"
          aria-label={formatMessage(messages.clean)}
        />
      </span>
    </div>
  );
};

export default Toolbar;
