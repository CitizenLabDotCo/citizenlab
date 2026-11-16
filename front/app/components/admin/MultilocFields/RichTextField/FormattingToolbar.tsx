import React, { useEffect, useState } from 'react';

import Quill from 'quill';
import QuillToolbar from 'quill/modules/toolbar';
import { Key } from 'react-aria-components';

import quillMessages from 'components/UI/QuillEditor/messages';
import tracks from 'components/UI/QuillEditor/tracks';

import Menu, { MenuItem, MenuTrigger } from 'design-system/Menu';
import RichTextToolbar, {
  RichTextToolbarButton,
} from 'design-system/RichTextToolbar';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

interface Props {
  editor: Quill | null;
  noImages: boolean;
  noVideos: boolean;
  noLinks: boolean;
  noAlign: boolean;
  limitedTextFormatting: boolean;
  withCTAButton: boolean;
}

type Heading = 'title' | 'subtitle' | 'normal';
type Align = 'left' | 'center' | 'right';
type ListType = 'bullet' | 'ordered';

type ActiveFormats = {
  bold: boolean;
  italic: boolean;
  list: ListType | null;
  heading: Heading;
  align: Align;
};

const NO_FORMATS: ActiveFormats = {
  bold: false,
  italic: false,
  list: null,
  heading: 'normal',
  align: 'left',
};

// Quill's header values, as the old toolbar's picker set them.
const HEADER_VALUES: Record<Heading, number | false> = {
  title: 2,
  subtitle: 3,
  normal: false,
};

const ALIGN_VALUES: Record<Align, string | false> = {
  left: false,
  center: 'center',
  right: 'right',
};

const HEADINGS: Heading[] = ['title', 'subtitle', 'normal'];
const ALIGNS: Align[] = ['left', 'center', 'right'];

const isHeading = (key: Key): key is Heading =>
  HEADINGS.some((heading) => heading === key);
const isAlign = (key: Key): key is Align =>
  ALIGNS.some((align) => align === key);

const toHeading = (header: unknown): Heading => {
  if (header === 2) return 'title';
  if (header === 3) return 'subtitle';
  return 'normal';
};
const toAlign = (align: unknown): Align =>
  align === 'center' || align === 'right' ? align : 'left';
const toList = (list: unknown): ListType | null =>
  list === 'bullet' || list === 'ordered' ? list : null;

// Drives Quill from the design-system toolbar with the formats and handlers
// the old Quill toolbar used. Quill's own (hidden) toolbar keeps its handlers
// for links, images, videos and remove formatting, so these buttons call them.
const FormattingToolbar = ({
  editor,
  noImages,
  noVideos,
  noLinks,
  noAlign,
  limitedTextFormatting,
  withCTAButton,
}: Props) => {
  const { formatMessage } = useIntl();
  const [active, setActive] = useState<ActiveFormats>(NO_FORMATS);

  const headingLabels: Record<Heading, string> = {
    title: formatMessage(quillMessages.title),
    subtitle: formatMessage(quillMessages.subtitle),
    normal: formatMessage(quillMessages.normalText),
  };
  const alignLabels: Record<Align, string> = {
    left: formatMessage(quillMessages.alignLeft),
    center: formatMessage(quillMessages.alignCenter),
    right: formatMessage(quillMessages.alignRight),
  };

  useEffect(() => {
    if (!editor) return;

    // Reads the range the way Quill's own toolbar does, without updating the
    // editor from inside its own change event. While a menu has the focus the
    // last range is used, so the heading and alignment pickers keep showing it.
    const updateActive = () => {
      const [range] = editor.selection.getRange();
      const formats = editor.getFormat(range ?? editor.selection.savedRange);
      setActive({
        bold: !!formats.bold,
        italic: !!formats.italic,
        list: toList(formats.list),
        heading: toHeading(formats.header),
        align: toAlign(formats.align),
      });
    };

    editor.on('editor-change', updateActive);
    return () => {
      editor.off('editor-change', updateActive);
    };
  }, [editor]);

  // Like Quill's own toolbar: focus first, which brings back the selection the
  // editor had before the button took focus.
  const toggleFormat = (format: 'bold' | 'italic') => {
    if (!editor) return;
    editor.focus();
    editor.format(format, !editor.getFormat()[format], 'user');
    trackEventByName(tracks.basicEditing, { type: format });
  };

  const toggleList = (list: ListType) => {
    if (!editor) return;
    editor.focus();
    const isList = editor.getFormat().list === list;
    editor.format('list', isList ? false : list, 'user');
    trackEventByName(tracks.advancedEditing, { type: 'list', option: list });
  };

  // Line formats from a menu: the menu holds the focus, so they go on the
  // editor's last range rather than on the current selection.
  const formatLines = (
    format: 'header' | 'align',
    value: string | number | false
  ) => {
    if (!editor) return;
    const { index, length } = editor.selection.savedRange;
    editor.formatLine(index, length, format, value, 'user');
  };

  const setHeading = (key: Key) => {
    if (!isHeading(key)) return;
    formatLines('header', HEADER_VALUES[key]);
    trackEventByName(tracks.advancedEditing, { type: 'heading', option: key });
  };

  const setAlign = (key: Key) => {
    if (!isAlign(key)) return;
    formatLines('align', ALIGN_VALUES[key]);
    trackEventByName(tracks.advancedEditing, { type: 'align', option: key });
  };

  const callQuillHandler = (format: 'link' | 'image' | 'video' | 'clean') => {
    if (!editor) return;
    const toolbar = editor.getModule('toolbar');
    if (!(toolbar instanceof QuillToolbar)) return;
    editor.focus();
    // A selection inside a link removes the link, as Quill's link button does.
    const value = format === 'link' ? !editor.getFormat().link : true;
    toolbar.handlers[format]?.call(toolbar, value);
  };

  // The old toolbar's "Add button": turns the selected text into a button link.
  const addCTAButton = () => {
    if (!editor) return;
    editor.focus();
    const selection = editor.getSelection();
    if (selection && selection.length > 0) {
      const url = prompt(formatMessage(quillMessages.customLinkPrompt));
      editor.format('button', url, 'user');
    }
  };

  return (
    <RichTextToolbar aria-label={formatMessage(messages.formatting)}>
      {!limitedTextFormatting && (
        <MenuTrigger>
          <RichTextToolbarButton text={headingLabels[active.heading]} hasMenu />
          <Menu
            selectionMode="single"
            selectedKeys={new Set([active.heading])}
            onAction={setHeading}
          >
            {HEADINGS.map((heading) => (
              <MenuItem key={heading} id={heading}>
                {headingLabels[heading]}
              </MenuItem>
            ))}
          </Menu>
        </MenuTrigger>
      )}
      <RichTextToolbarButton
        icon="bold-14"
        aria-label={formatMessage(quillMessages.bold)}
        isSelected={active.bold}
        onPress={() => toggleFormat('bold')}
      />
      <RichTextToolbarButton
        icon="italic-14"
        aria-label={formatMessage(quillMessages.italic)}
        isSelected={active.italic}
        onPress={() => toggleFormat('italic')}
      />
      {!noLinks && (
        <RichTextToolbarButton
          icon="link-14"
          aria-label={formatMessage(quillMessages.link)}
          isSelected={false}
          onPress={() => {
            callQuillHandler('link');
            trackEventByName(tracks.basicEditing, { type: 'link' });
          }}
        />
      )}
      {!noLinks && withCTAButton && (
        <RichTextToolbarButton
          text={formatMessage(quillMessages.customLink)}
          isSelected={false}
          onPress={addCTAButton}
        />
      )}
      {!limitedTextFormatting && !noAlign && (
        <MenuTrigger>
          <RichTextToolbarButton text={alignLabels[active.align]} hasMenu />
          <Menu
            selectionMode="single"
            selectedKeys={new Set([active.align])}
            onAction={setAlign}
          >
            {ALIGNS.map((align) => (
              <MenuItem key={align} id={align}>
                {alignLabels[align]}
              </MenuItem>
            ))}
          </Menu>
        </MenuTrigger>
      )}
      {!limitedTextFormatting && (
        <>
          <RichTextToolbarButton
            // No ordered-list icon is drawn yet.
            text="1."
            aria-label={formatMessage(quillMessages.orderedList)}
            isSelected={active.list === 'ordered'}
            onPress={() => toggleList('ordered')}
          />
          <RichTextToolbarButton
            icon="list-14"
            aria-label={formatMessage(quillMessages.unorderedList)}
            isSelected={active.list === 'bullet'}
            onPress={() => toggleList('bullet')}
          />
        </>
      )}
      {!noImages && (
        <RichTextToolbarButton
          icon="image-14"
          aria-label={formatMessage(quillMessages.image)}
          isSelected={false}
          onPress={() => {
            callQuillHandler('image');
            trackEventByName(tracks.imageEditing);
          }}
        />
      )}
      {!noVideos && (
        <RichTextToolbarButton
          icon="square-play-14"
          aria-label={formatMessage(quillMessages.video)}
          isSelected={false}
          onPress={() => {
            callQuillHandler('video');
            trackEventByName(tracks.videoEditing);
          }}
        />
      )}
      <RichTextToolbarButton
        // No remove-formatting icon is drawn yet; Tx is the usual mark for it.
        text="Tx"
        aria-label={formatMessage(quillMessages.clean)}
        isSelected={false}
        onPress={() => callQuillHandler('clean')}
      />
    </RichTextToolbar>
  );
};

export default FormattingToolbar;
