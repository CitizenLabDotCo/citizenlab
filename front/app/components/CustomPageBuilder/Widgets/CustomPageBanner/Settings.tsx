import React, { useRef } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';
import { ImageSizes, Multiloc } from 'typings';

import useAddContentBuilderImage from 'api/content_builder_images/useAddContentBuilderImage';
import { ICustomPageAttributes } from 'api/custom_pages/types';

import BannerHeaderFields from 'components/admin/GenericHeroBannerForm/BannerHeaderFields';
import BannerImageFields from 'components/admin/GenericHeroBannerForm/BannerImageFields';
import LayoutSettingField from 'components/admin/GenericHeroBannerForm/LayoutSettingField';
import heroBannerMessages from 'components/admin/GenericHeroBannerForm/messages';
import { SectionField, SubSectionTitle } from 'components/admin/Section';
import CTARadioButtons from 'components/LandingPages/admin/CTARadioButtons';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import { CustomPageBannerProps } from './types';

const CTA_TYPES: ICustomPageAttributes['banner_cta_button_type'][] = [
  'no_button',
  'customized_button',
];

const CustomPageBannerSettings = () => {
  const { formatMessage } = useIntl();
  const { mutateAsync: addContentBuilderImage } = useAddContentBuilderImage();
  const {
    actions: { setProp },
    banner,
  } = useNode((node) => ({
    banner: node.data.props as CustomPageBannerProps,
  }));

  // Pass only the image the panel opened with. The fields keep a local copy of a picked image for
  // the cropper, and feeding each upload back in would close it after the first crop.
  const openedWithImageUrl = useRef(banner.image?.imageUrl);
  const openedWithImage: ImageSizes | null = openedWithImageUrl.current
    ? {
        large: openedWithImageUrl.current,
        medium: openedWithImageUrl.current,
        small: openedWithImageUrl.current,
      }
    : null;

  const set = (change: (props: CustomPageBannerProps) => void) =>
    setProp((props: CustomPageBannerProps) => change(props));

  const handleAddImage = async (base64: string) => {
    const response = await addContentBuilderImage(base64);
    set((props) => {
      props.image = {
        dataCode: response.data.attributes.code,
        imageUrl: response.data.attributes.image_url,
      };
    });
  };

  // No layout shows an overlay without an image.
  const handleRemoveImage = () =>
    set((props) => {
      props.image = {};
      props.overlayColor = null;
      props.overlayOpacity = null;
    });

  return (
    <Box my="20px" display="flex" flexDirection="column" gap="16px">
      <LayoutSettingField
        stacked
        bannerLayout={banner.layout}
        onChange={(layout) =>
          set((props) => {
            props.layout = layout;
          })
        }
      />
      <BannerImageFields
        bannerLayout={banner.layout}
        bannerOverlayColor={banner.overlayColor}
        bannerOverlayOpacity={banner.overlayOpacity}
        headerBg={openedWithImage}
        onAddImage={handleAddImage}
        onRemoveImage={handleRemoveImage}
        onOverlayChange={(opacity, color) =>
          set((props) => {
            props.overlayOpacity = opacity;
            props.overlayColor = color;
          })
        }
      />
      <BannerHeaderFields
        bannerHeaderMultiloc={banner.headerMultiloc}
        bannerSubheaderMultiloc={banner.subheaderMultiloc}
        onHeaderChange={(headerMultiloc: Multiloc) =>
          set((props) => {
            props.headerMultiloc = headerMultiloc;
          })
        }
        onSubheaderChange={(subheaderMultiloc: Multiloc) =>
          set((props) => {
            props.subheaderMultiloc = subheaderMultiloc;
          })
        }
        title={formatMessage(heroBannerMessages.bannerTextTitle)}
        inputLabelText={formatMessage(heroBannerMessages.bannerHeader)}
        subheaderInputLabelText={formatMessage(
          heroBannerMessages.bannerHeaderSubtitle
        )}
      />
      <SubSectionTitle>{formatMessage(messages.buttonTitle)}</SubSectionTitle>
      <SectionField>
        <CTARadioButtons
          id="custom"
          ctaTypes={CTA_TYPES}
          currentCtaType={banner.ctaType}
          ctaButtonMultiloc={banner.ctaTextMultiloc}
          ctaButtonUrl={banner.ctaUrl}
          handleCTAButtonTypeOnChange={(ctaType) =>
            set((props) => {
              // The shared radio is typed for the homepage's variants too; only these two
              // are offered here.
              if (ctaType === 'no_button' || ctaType === 'customized_button') {
                props.ctaType = ctaType;
              }
            })
          }
          handleCTAButtonTextMultilocOnChange={(ctaTextMultiloc) =>
            set((props) => {
              props.ctaTextMultiloc = ctaTextMultiloc;
            })
          }
          handleCTAButtonUrlOnChange={(ctaUrl) =>
            set((props) => {
              props.ctaUrl = ctaUrl;
            })
          }
          apiErrors={null}
          buttonTextMultilocFieldName="banner_cta_button_multiloc"
          buttonUrlFieldName="banner_cta_button_url"
        />
      </SectionField>
    </Box>
  );
};

export default CustomPageBannerSettings;
