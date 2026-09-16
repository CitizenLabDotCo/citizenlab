import React from 'react';

import {
  Box,
  fontSizes,
  Image,
  Radio,
  IconTooltip,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import {
  ICustomPageAttributes,
  TCustomPageBannerLayout,
} from 'api/custom_pages/types';

import { SectionField, SubSectionTitle } from 'components/admin/Section';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from '../messages';

import FullWidthBannerLayoutActive from './layout_previews/full_width_banner_layout_active.jpg';
import FullWidthBannerLayoutInactive from './layout_previews/full_width_banner_layout_inactive.jpg';
import TwoColumnLayoutActive from './layout_previews/two_column_layout_active.jpg';
import TwoColumnLayoutInactive from './layout_previews/two_column_layout_inactive.jpg';
import TwoRowLayoutActive from './layout_previews/two_row_layout_active.jpg';
import TwoRowLayoutInactive from './layout_previews/two_row_layout_inactive.jpg';

const LayoutOption = styled.label`
  display: flex;
  flex-direction: column;
  align-items: start;
  font-size: ${fontSizes.base}px;
  cursor: pointer;
`;

const LayoutOptionTop = styled.div`
  display: flex;
  align-items: center;
`;

export interface Props {
  bannerLayout: ICustomPageAttributes['banner_layout'];

  onChange: (bannerLayout: TCustomPageBannerLayout) => void;
  // A builder settings panel is too narrow for the options side by side, so it stacks them
  // with full-width previews, as the homepage banner's picker does.
  stacked?: boolean;
}

const LayoutSettingField = ({
  bannerLayout,
  onChange,
  stacked = false,
}: Props) => {
  const { formatMessage } = useIntl();
  const previewWidth = stacked ? '100%' : '220px';
  return (
    <SectionField key="layout">
      <SubSectionTitle>
        <FormattedMessage {...messages.chooseLayout} />
      </SubSectionTitle>
      <Box
        display="flex"
        flexDirection={stacked ? 'column' : 'row'}
        gap={stacked ? '16px' : '20px'}
      >
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
                    placement="bottom-start"
                    content={
                      <FormattedMessage
                        {...messages.fullWidthBannerTooltip}
                        values={{
                          link: (
                            <a
                              href={formatMessage(
                                messages.imageSupportPageURL2
                              )}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
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
          <Image
            alt=""
            width={previewWidth}
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
            <Image
              alt=""
              width={previewWidth}
              src={
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
                    placement="bottom-start"
                    content={
                      <FormattedMessage
                        {...messages.twoRowBannerTooltip}
                        values={{
                          link: (
                            <a
                              href={formatMessage(
                                messages.imageSupportPageURL2
                              )}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
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
          <Image
            alt=""
            width={previewWidth}
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
                    placement="bottom-start"
                    content={
                      <FormattedMessage
                        {...messages.fixedRatioBannerTooltip}
                        values={{
                          link: (
                            <a
                              href={formatMessage(
                                messages.imageSupportPageURL2
                              )}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
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
          <Image
            alt=""
            width={previewWidth}
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
