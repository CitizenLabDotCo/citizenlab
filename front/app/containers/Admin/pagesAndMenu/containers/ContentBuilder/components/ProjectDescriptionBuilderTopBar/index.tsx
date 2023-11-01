import React, { useState } from 'react';

// hooks
import { useEditor, SerializedNodes } from '@craftjs/core';
import useUpdateHomepageSettings from 'api/home_page/useUpdateHomepageSettings';

// components
import Container from 'components/admin/ContentBuilder/TopBar/Container';
import GoBackButton from 'components/admin/ContentBuilder/TopBar/GoBackButton';
import LocaleSwitcher from 'components/admin/ContentBuilder/TopBar/LocaleSwitcher';
import PreviewToggle from 'components/admin/ContentBuilder/TopBar/PreviewToggle';
import SaveButton from 'components/admin/ContentBuilder/TopBar/SaveButton';
import Button from 'components/UI/Button';
import { Box, Title } from '@citizenlab/cl2-component-library';

// i18n

// routing
import clHistory from 'utils/cl-router/history';

// types
import { Locale } from 'typings';

type ProjectDescriptionBuilderTopBarProps = {
  hasPendingState?: boolean;
  localesWithError: Locale[];
  previewEnabled: boolean;
  setPreviewEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  selectedLocale: Locale | undefined;
  onSelectLocale: (args: {
    locale: Locale;
    editorData: SerializedNodes;
  }) => void;
};

const ProjectDescriptionBuilderTopBar = ({
  previewEnabled,
  setPreviewEnabled,
  selectedLocale,
  onSelectLocale,
  localesWithError,
  hasPendingState,
}: ProjectDescriptionBuilderTopBarProps) => {
  const [loading, setLoading] = useState(false);
  const { query } = useEditor();
  const { mutateAsync: updateHomepage } = useUpdateHomepageSettings();

  const disableSave = localesWithError.length > 0;

  const goBack = () => {
    clHistory.push(`/admin/pages-menu`);
  };

  const handleSave = async () => {
    if (selectedLocale) {
      try {
        setLoading(true);
        await updateHomepage({
          craftjs_json: query.getSerializedNodes(),
        });
      } catch {
        // Do nothing
      }
      setLoading(false);
    }
  };

  const handleSelectLocale = (locale: Locale) => {
    const editorData = query.getSerializedNodes();
    onSelectLocale({ locale, editorData });
  };

  const handleTogglePreview = () => {
    setPreviewEnabled((previewEnabled) => !previewEnabled);
  };

  return (
    <Container>
      <GoBackButton onClick={goBack} />
      <Box display="flex" p="15px" flexGrow={1} alignItems="center">
        <Box flexGrow={2}>
          <Title>Homepage</Title>
        </Box>
        <LocaleSwitcher
          selectedLocale={selectedLocale}
          localesWithError={localesWithError}
          onSelectLocale={handleSelectLocale}
        />
        <Box ml="24px" />
        <PreviewToggle
          checked={previewEnabled}
          onChange={handleTogglePreview}
        />
        <Button
          id="e2e-view-project-button"
          buttonStyle="secondary"
          icon="eye"
          mx="20px"
          linkTo={`/`}
          openLinkInNewTab
        >
          View homepage
        </Button>
        <SaveButton
          disabled={!!(disableSave || hasPendingState)}
          processing={loading}
          onClick={handleSave}
        />
      </Box>
    </Container>
  );
};

export default ProjectDescriptionBuilderTopBar;

const newContentBuilderJson = {
  craftjs_json: {
    ROOT: {
      type: 'div',
      isCanvas: true,
      props: {
        id: 'e2e-content-builder-frame',
      },
      displayName: 'div',
      custom: {},
      hidden: false,
      nodes: [
        'B9QHO4ba1H',
        '7zKQTbb6G4',
        'vBZrQpAg1m',
        'SB0rJMwvT1',
        'MksmSLCEnY',
      ],
      linkedNodes: {},
    },
    B9QHO4ba1H: {
      type: {
        resolvedName: 'TextMultiloc',
      },
      isCanvas: false,
      props: {
        text: {
          en: '\u003cp\u003eThis is some text. You can edit and format it by using the editor in the panel on the right.\u003c/p\u003e',
          'nl-BE':
            '\u003cp\u003eThis is some text. You can edit and format it by using the editor in the panel on the right.\u003c/p\u003e',
          'fr-BE':
            '\u003cp\u003eThis is some text. You can edit and format it by using the editor in the panel on the right.\u003c/p\u003e',
        },
      },
      displayName: 'TextMultiloc',
      custom: {
        title: {
          id: 'app.containers.admin.ContentBuilder.textMultiloc',
          defaultMessage: 'Text',
        },
      },
      parent: 'ROOT',
      hidden: false,
      nodes: [],
      linkedNodes: {},
    },
    '7zKQTbb6G4': {
      type: {
        resolvedName: 'ButtonMultiloc',
      },
      isCanvas: false,
      props: {
        text: {
          en: 'Button',
          'nl-BE': 'Button',
          'fr-BE': 'Button',
        },
        url: 'https://www.youtube.com/watch?v=GjRMW4EcRAE',
        type: 'primary',
        alignment: 'left',
      },
      displayName: 'Button',
      custom: {
        title: {
          id: 'app.containers.admin.ContentBuilder.buttonMultiloc',
          defaultMessage: 'Button',
        },
        noPointerEvents: true,
      },
      parent: 'ROOT',
      hidden: false,
      nodes: [],
      linkedNodes: {},
    },
    vBZrQpAg1m: {
      type: {
        resolvedName: 'ImageMultiloc',
      },
      isCanvas: false,
      props: {
        alt: {
          en: 'horse',
          'nl-BE': 'horse',
          'fr-BE': 'horse',
        },
        dataCode: '7ae9d300-d79f-4437-8253-456f347f2bb2',
        imageUrl:
          'http://localhost:4000/uploads/c72c5211-8e03-470b-9564-04ec0a8c322b/content_builder/layout_image/image/11663b8c-0798-48e1-a88c-b8e6a512e697/18a87361-7504-4827-9e23-4c732aadb624.jpeg',
      },
      displayName: 'Image',
      custom: {
        title: {
          id: 'app.containers.admin.ContentBuilder.imageMultiloc',
          defaultMessage: 'Image',
        },
      },
      parent: 'ROOT',
      hidden: false,
      nodes: [],
      linkedNodes: {},
    },
    SB0rJMwvT1: {
      type: {
        resolvedName: 'IframeMultiloc',
      },
      isCanvas: false,
      props: {
        url: 'https://www.youtube.com/embed/GjRMW4EcRAE?si=0-WGpvqxu73JllxH',
        height: 500,
        hasError: false,
        selectedLocale: 'fr-BE',
        errorType: 'invalidUrl',
        title: {
          en: 'deep focus',
          'nl-BE': 'deep focus',
          'fr-BE': 'deep focus',
        },
      },
      displayName: 'Iframe',
      custom: {
        title: {
          id: 'app.containers.admin.ContentBuilder.IframeMultiloc.url',
          defaultMessage: 'Embed',
        },
        noPointerEvents: true,
      },
      parent: 'ROOT',
      hidden: false,
      nodes: [],
      linkedNodes: {},
    },
    MksmSLCEnY: {
      type: {
        resolvedName: 'AccordionMultiloc',
      },
      isCanvas: false,
      props: {
        title: {
          en: 'Accordion title',
          'nl-BE': 'Accordion title',
          'fr-BE': 'Accordion title',
        },
        text: {
          en: '\u003cp\u003eThis is expandable accordion content. You can edit and format it by using the editor in the panel on the right.\u003c/p\u003e',
          'nl-BE':
            '\u003cp\u003eThis is expandable accordion content. You can edit and format it by using the editor in the panel on the right.\u003c/p\u003e',
          'fr-BE':
            '\u003cp\u003eThis is expandable accordion content. You can edit and format it by using the editor in the panel on the right.\u003c/p\u003e',
        },
      },
      displayName: 'Accordion',
      custom: {
        title: {
          id: 'app.containers.admin.ContentBuilder.accordionMultiloc',
          defaultMessage: 'Accordion',
        },
      },
      parent: 'ROOT',
      hidden: false,
      nodes: [],
      linkedNodes: {},
    },
  },
};

const oldContentBuilderJson = {
  craftjs_jsonmultiloc: {
    en: {
      ROOT: {
        type: 'div',
        isCanvas: true,
        props: {
          id: 'e2e-content-builder-frame',
        },
        displayName: 'div',
        custom: {},
        hidden: false,
        nodes: [
          '5AdxXCP4yc',
          '_vZz5lc5bk',
          'SA49qAVwhW',
          '0U3M6DNsmU',
          'yy2SEQfJ3A',
        ],
        linkedNodes: {},
      },
      '0U3M6DNsmU': {
        type: {
          resolvedName: 'Iframe',
        },
        isCanvas: false,
        props: {
          url: 'https://www.youtube.com/embed/GjRMW4EcRAE?si=0-WGpvqxu73JllxH',
          height: 500,
          title: 'deep focus',
          hasError: false,
          errorType: 'invalidUrl',
          selectedLocale: 'en',
        },
        displayName: 'Iframe',
        custom: {
          title: {
            id: 'app.containers.admin.ContentBuilder.url',
            defaultMessage: 'Embed',
          },
          noPointerEvents: true,
        },
        parent: 'ROOT',
        hidden: false,
        nodes: [],
        linkedNodes: {},
      },
      '5AdxXCP4yc': {
        type: {
          resolvedName: 'Text',
        },
        isCanvas: false,
        props: {
          text: 'This is some text. You can edit and format it by using the editor in the panel on the right.',
        },
        displayName: 'Text',
        custom: {
          title: {
            id: 'app.containers.admin.ContentBuilder.text',
            defaultMessage: 'Text',
          },
        },
        parent: 'ROOT',
        hidden: false,
        nodes: [],
        linkedNodes: {},
      },
      SA49qAVwhW: {
        type: {
          resolvedName: 'Image',
        },
        isCanvas: false,
        props: {
          alt: 'Horse',
          dataCode: '9f71c6b4-9862-407f-9815-ddd0ca00bad8',
          imageUrl:
            'http://localhost:4000/uploads/c72c5211-8e03-470b-9564-04ec0a8c322b/content_builder/layout_image/image/a2640f7c-0da2-42fa-add2-198b951e0741/faf628a1-9b10-45ac-a14d-f4ff3dd0751b.jpeg',
        },
        displayName: 'Image',
        custom: {
          title: {
            id: 'app.containers.admin.ContentBuilder.image',
            defaultMessage: 'Image',
          },
        },
        parent: 'ROOT',
        hidden: false,
        nodes: [],
        linkedNodes: {},
      },
      _vZz5lc5bk: {
        type: {
          resolvedName: 'Button',
        },
        isCanvas: false,
        props: {
          url: 'https://www.youtube.com/watch?v=GjRMW4EcRAE',
          text: 'Button',
          type: 'primary',
          alignment: 'left',
        },
        displayName: 'Button',
        custom: {
          title: {
            id: 'app.containers.admin.ContentBuilder.button',
            defaultMessage: 'Button',
          },
          noPointerEvents: true,
        },
        parent: 'ROOT',
        hidden: false,
        nodes: [],
        linkedNodes: {},
      },
      yy2SEQfJ3A: {
        type: {
          resolvedName: 'Accordion',
        },
        isCanvas: false,
        props: {
          text: 'This is expandable accordion content. You can edit and format it by using the editor in the panel on the right.',
          title: 'Accordion title',
        },
        displayName: 'Accordion',
        custom: {
          title: {
            id: 'app.containers.admin.ContentBuilder.accordion',
            defaultMessage: 'Accordion',
          },
        },
        parent: 'ROOT',
        hidden: false,
        nodes: [],
        linkedNodes: {},
      },
    },
  },
};
