import React from 'react';

// components
import {
  Box,
  fontSizes,
  Radio,
  IconTooltip,
} from '@citizenlab/cl2-component-library';
import { SectionField, SubSectionTitle } from 'components/admin/Section';

import FullWidthBannerLayoutActive from './layout_previews/full_width_banner_layout_active.jpg';
import FullWidthBannerLayoutInactive from './layout_previews/full_width_banner_layout_inactive.jpg';
import TwoColumnLayoutActive from './layout_previews/two_column_layout_active.jpg';
import TwoColumnLayoutInactive from './layout_previews/two_column_layout_inactive.jpg';
import TwoRowLayoutActive from './layout_previews/two_row_layout_active.jpg';
import TwoRowLayoutInactive from './layout_previews/two_row_layout_inactive.jpg';

// style
import styled from 'styled-components';
// i18n
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from '../messages';
import cropperMessages from 'components/admin/ImageCropper/messages';

import {
  ICustomPageAttributes,
  TCustomPageBannerLayout,
} from 'services/customPages';
import {
  IHomepageSettingsAttributes,
  THomepageBannerLayout,
} from 'services/homepageSettings';

const LayoutPreview = styled.img`
  width: 220px;
`;

const LayoutOption = styled.label`
  display: flex;
  flex-direction: column;
  align-items: start;
  margin-right: 20px;
  font-size: ${fontSizes.base}px;
  cursor: pointer;
`;

const LayoutOptionTop = styled.div`
  display: flex;
  align-items: center;
`;

export interface Props {
  bannerLayout:
    | ICustomPageAttributes['banner_layout']
    | IHomepageSettingsAttributes['banner_layout'];
  onChange: (
    bannerLayout: THomepageBannerLayout | TCustomPageBannerLayout
  ) => void;
}

const LayoutSettingField = ({ bannerLayout, onChange }: Props) => {
  const { formatMessage } = useIntl();
  return (
    <SectionField key="layout">
      <SubSectionTitle>
        <FormattedMessage {...messages.chooseLayout} />
      </SubSectionTitle>
      <Box display="flex">
        <LayoutOption data-cy="e2e-full-width-banner-layout-option">
          <LayoutOptionTop>
            <Radio
              onChange={onChange}
              currentValue={bannerLayout}
              value="full_width_banner_layout"
              name="banner-layout"
              id="banner-full-width-banner-layout"
              label={
                <Box display="flex" gap="8px">
                  {formatMessage(messages.fullWidthBannerLayout)}
                  <IconTooltip
                    content={
                      <FormattedMessage
                        {...messages.fullWidthBannerTooltip}
                        values={{
                          link: (
                            <a
                              href={formatMessage(
                                cropperMessages.imageSupportPageURL
                              )}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <FormattedMessage
                                {...messages.fullWidthBannerTooltipLink}
                              />
                            </a>
                          ),
                        }}
                      />
                    }
                  />
                </Box>
              }
            />
          </LayoutOptionTop>
          <LayoutPreview
            src={
              bannerLayout === 'full_width_banner_layout'
                ? FullWidthBannerLayoutActive
                : FullWidthBannerLayoutInactive
            }
          />
        </LayoutOption>

        {bannerLayout === 'two_column_layout' && (
          <LayoutOption>
            <LayoutOptionTop>
              <Radio
                onChange={onChange}
                currentValue={bannerLayout}
                value="two_column_layout"
                name="banner-layout"
                id="banner-two-column-layout"
                label={formatMessage(messages.TwoColumnLayout)}
              />
            </LayoutOptionTop>
            <LayoutPreview
              src={
                bannerLayout === 'two_column_layout'
                  ? TwoColumnLayoutActive
                  : TwoColumnLayoutInactive
              }
            />
          </LayoutOption>
        )}

        <LayoutOption>
          <LayoutOptionTop data-cy="e2e-two-row-layout-option">
            <Radio
              onChange={onChange}
              currentValue={bannerLayout}
              value="two_row_layout"
              name="banner-layout"
              id="banner-two-row-layout"
              label={
                <Box display="flex" gap="8px">
                  {formatMessage(messages.twoRowLayout)}
                  <IconTooltip
                    content={
                      <FormattedMessage
                        {...messages.twoRowBannerTooltip}
                        values={{
                          link: (
                            <a
                              href={formatMessage(
                                cropperMessages.imageSupportPageURL
                              )}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <FormattedMessage
                                {...messages.twoRowBannerTooltipLink}
                              />
                            </a>
                          ),
                        }}
                      />
                    }
                  />
                </Box>
              }
            />
          </LayoutOptionTop>
          <LayoutPreview
            src={
              bannerLayout === 'two_row_layout'
                ? TwoRowLayoutActive
                : TwoRowLayoutInactive
            }
          />
        </LayoutOption>
        <LayoutOption>
          <LayoutOptionTop data-cy="e2e-fixed-ratio-layout-option">
            <Radio
              onChange={onChange}
              currentValue={bannerLayout}
              value="fixed_ratio_layout"
              name="banner-layout"
              id="banner_fixed_ratio_layout"
              label={
                <Box display="flex" gap="8px">
                  {formatMessage(messages.fixedRatioLayout)}
                  <IconTooltip
                    content={
                      <FormattedMessage
                        {...messages.fixedRatioBannerTooltip}
                        values={{
                          link: (
                            <a
                              href={formatMessage(
                                cropperMessages.imageSupportPageURL
                              )}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <FormattedMessage
                                {...messages.fixedRatioBannerTooltipLink}
                              />
                            </a>
                          ),
                        }}
                      />
                    }
                  />
                </Box>
              }
            />
          </LayoutOptionTop>
          <LayoutPreview
            src={
              bannerLayout === 'fixed_ratio_layout'
                ? FullWidthBannerLayoutActive
                : FullWidthBannerLayoutInactive
            }
          />
        </LayoutOption>
      </Box>
    </SectionField>
  );
};

export default LayoutSettingField;
