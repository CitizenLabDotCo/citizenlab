import React from 'react';

import {
  Box,
  colors,
  stylingConsts,
  Text,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';
import FormLanguageSwitchers from '../PageControlButtons/FormLanguageSwitchers';

import { FORM_CONTENT_MAX_WIDTH } from './FormPageLayout';

type Props = {
  formCompletionPercentage: number;
  // 1-based number of the current page, and the number of pages to fill in
  // (without the page shown after submitting). No counter when omitted or
  // past the last of those pages.
  currentPage?: number;
  totalPages?: number;
  // 'fixed' floats above the bottom of the screen. 'relative' leaves the
  // positioning to a wrapper (used for the form builder preview).
  position?: 'fixed' | 'relative';
  // As wide as the form column.
  maxWidth?: string;
};

// Card floating just above the bottom of the screen, as wide as the form:
// the language switchers, the progress bar and a page counter.
const ProgressFooter = ({
  formCompletionPercentage,
  currentPage,
  totalPages,
  position = 'fixed',
  maxWidth = FORM_CONTENT_MAX_WIDTH,
}: Props) => {
  const theme = useTheme();
  const { formatMessage } = useIntl();
  const isSmallerThanPhone = useBreakpoint('phone');
  const percentage = Math.min(100, Math.max(0, formCompletionPercentage));
  const showCounter =
    currentPage !== undefined &&
    totalPages !== undefined &&
    currentPage <= totalPages;

  return (
    <Box
      position={position}
      left="0"
      right="0"
      bottom="0"
      w="100%"
      zIndex="2"
      // Only the card itself catches clicks, not the space around it.
      pointerEvents="none"
    >
      <Box
        maxWidth={maxWidth}
        mx="auto"
        px={isSmallerThanPhone ? '12px' : '24px'}
        pb={isSmallerThanPhone ? '12px' : '20px'}
      >
        <Box
          pointerEvents="auto"
          display="flex"
          alignItems="center"
          gap="16px"
          px="16px"
          py="12px"
          bgColor={colors.white}
          border={`1px solid ${colors.grey300}`}
          borderRadius={stylingConsts.borderRadius}
          boxShadow="0 4px 16px rgba(0, 0, 0, 0.10)"
        >
          <FormLanguageSwitchers />
          <Box
            flex="1"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(percentage)}
            aria-label={formatMessage(messages.progressBarLabel)}
            h="8px"
            borderRadius="4px"
            bgColor={colors.grey200}
            overflow="hidden"
          >
            <Box
              h="100%"
              w={`${percentage}%`}
              borderRadius="4px"
              bgColor={theme.colors.tenantPrimary}
              style={{
                transition: 'width 400ms cubic-bezier(0.2, 0.8, 0.2, 1)',
              }}
            />
          </Box>
          {showCounter && (
            <Text
              m="0px"
              fontSize="s"
              fontWeight="bold"
              color="textSecondary"
              style={{
                whiteSpace: 'nowrap',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {formatMessage(messages.pageProgress, {
                current: currentPage,
                total: totalPages,
              })}
            </Text>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ProgressFooter;
