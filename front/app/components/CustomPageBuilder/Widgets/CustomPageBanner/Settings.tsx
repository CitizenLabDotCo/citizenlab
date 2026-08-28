import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';
import { Multiloc } from 'typings';

import {
  ICustomPageAttributes,
  TCustomPageCTAType,
} from 'api/custom_pages/types';
import useCustomPageById from 'api/custom_pages/useCustomPageById';

import BannerHeaderFields from 'containers/Admin/pagesAndMenu/containers/GenericHeroBannerForm/BannerHeaderFields';
import BannerImageFields from 'containers/Admin/pagesAndMenu/containers/GenericHeroBannerForm/BannerImageFields';
import LayoutSettingField from 'containers/Admin/pagesAndMenu/containers/GenericHeroBannerForm/LayoutSettingField';

import CTARadioButtons from 'components/LandingPages/admin/CTARadioButtons';

import { useIntl } from 'utils/cl-intl';

import { BannerDraft } from '../../customPageAttributeDrafts';
import useWidgetCustomPageId from '../useWidgetCustomPageId';

import messages from './messages';

const CTA_TYPES: TCustomPageCTAType[] = ['no_button', 'customized_button'];

// The same fields the legacy hero banner tab offers, driven by a draft that the builder's
// save commits to the page. Reused rather than rebuilt — they already type against
// ICustomPageAttributes, and one of them owns the image cropper.
const Settings = () => {
  const pageId = useWidgetCustomPageId();
  const { formatMessage } = useIntl();
  const { data: page } = useCustomPageById(pageId);
  const {
    actions: { setProp },
    draft,
  } = useNode((node) => ({
    draft: (node.data.props.draft ?? {}) as BannerDraft,
  }));

  if (!page) return null;

  // The draft covers only what the admin has touched; everything else still comes from the
  // page, so the panel shows the banner as it is now.
  const settings: ICustomPageAttributes = {
    ...page.data.attributes,
    ...draft,
    header_bg:
      draft.header_bg === undefined
        ? page.data.attributes.header_bg
        : draft.header_bg
        ? ({ large: draft.header_bg } as ICustomPageAttributes['header_bg'])
        : null,
  };

  const update = (change: BannerDraft) =>
    setProp((props: { draft?: BannerDraft }) => {
      props.draft = { ...props.draft, ...change };
    });

  return (
    <Box my="20px" display="flex" flexDirection="column" gap="16px">
      <LayoutSettingField
        bannerLayout={settings.banner_layout}
        onChange={(banner_layout) => update({ banner_layout })}
      />
      <BannerImageFields
        bannerLayout={settings.banner_layout}
        bannerOverlayColor={settings.banner_overlay_color}
        bannerOverlayOpacity={settings.banner_overlay_opacity}
        headerBg={settings.header_bg}
        onAddImage={(header_bg) => update({ header_bg })}
        onRemoveImage={() => update({ header_bg: null })}
        onOverlayChange={(banner_overlay_opacity, banner_overlay_color) =>
          update({ banner_overlay_opacity, banner_overlay_color })
        }
      />
      <BannerHeaderFields
        bannerHeaderMultiloc={settings.banner_header_multiloc}
        bannerSubheaderMultiloc={settings.banner_subheader_multiloc}
        onHeaderChange={(banner_header_multiloc: Multiloc) =>
          update({ banner_header_multiloc })
        }
        onSubheaderChange={(banner_subheader_multiloc: Multiloc) =>
          update({ banner_subheader_multiloc })
        }
        title={formatMessage(messages.textTitle)}
        inputLabelText={formatMessage(messages.headerLabel)}
        subheaderInputLabelText={formatMessage(messages.subheaderLabel)}
      />
      <CTARadioButtons
        id="custom"
        ctaTypes={CTA_TYPES}
        currentCtaType={settings.banner_cta_button_type}
        ctaButtonMultiloc={settings.banner_cta_button_multiloc}
        ctaButtonUrl={settings.banner_cta_button_url}
        handleCTAButtonTypeOnChange={(type) =>
          update({ banner_cta_button_type: type as TCustomPageCTAType })
        }
        handleCTAButtonTextMultilocOnChange={(banner_cta_button_multiloc) =>
          update({ banner_cta_button_multiloc })
        }
        handleCTAButtonUrlOnChange={(banner_cta_button_url) =>
          update({ banner_cta_button_url })
        }
        apiErrors={null}
        buttonTextMultilocFieldName="banner_cta_button_multiloc"
        buttonUrlFieldName="banner_cta_button_url"
      />
    </Box>
  );
};

export default Settings;
