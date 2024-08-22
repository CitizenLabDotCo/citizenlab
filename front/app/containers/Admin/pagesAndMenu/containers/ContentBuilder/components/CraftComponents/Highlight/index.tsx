import React from 'react';

import {
  Box,
  colors,
  useBreakpoint,
  Text,
  defaultCardStyle,
  media,
  Title,
  Input,
} from '@citizenlab/cl2-component-library';
import { useEditor, useNode } from '@craftjs/core';
import { Multiloc } from 'component-library/utils/typings';
import styled, { useTheme } from 'styled-components';

import useLocalize from 'hooks/useLocalize';

import { DEFAULT_PADDING } from 'components/admin/ContentBuilder/constants';
import Button from 'components/UI/Button';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';

import { useIntl } from 'utils/cl-intl';
import { removeUrlLocale } from 'utils/removeUrlLocale';

import messages from './messages';

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 60px 40px;
  position: relative;
  overflow: hidden;
  ${defaultCardStyle};

  ${media.tablet`
    padding: 60px 50px 50px;
  `}

  ${media.phone`
    flex-direction: column;
    align-items: flex-start;
    padding: 60px 30px 40px;
  `}
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;

  ${media.tablet`
    flex-direction: column;
    justify-content: center;
    align-items: stretch;
    margin-left: 20px;
  `}

  ${media.phone`
    margin-left: 0;
    width: 100%;
    margin-top: 20px;
  `}
`;

const StyledPrimaryButton = styled(Button)`
  margin-left: 20px;

  ${media.tablet`
    margin-top: 15px;
    margin-left: 0;
  `}

  ${media.phone`
    margin-top: 20px;
  `}
`;

type HighlightProps = {
  title?: Multiloc;
  description?: Multiloc;
  primaryButtonText?: Multiloc;
  primaryButtonLink?: string;
  secondaryButtonText?: Multiloc;
  secondaryButtonLink?: string;
};

const Highlight = ({
  title,
  description,
  primaryButtonText,
  primaryButtonLink,
  secondaryButtonText,
  secondaryButtonLink,
}: HighlightProps) => {
  const { enabled } = useEditor((state) => {
    return {
      enabled: state.options.enabled,
    };
  });

  const isInternalLink = (url?: string) => {
    if (!url) {
      return false;
    }
    return url.includes(window.location.hostname);
  };

  const openInNewTab = (url?: string) => {
    if (!url) {
      return false;
    }
    // Links that are relative or of same hostname should open in same window
    else if (isInternalLink(url)) {
      return false;
    } else if (!url.includes('.')) {
      return false;
    } else {
      return true;
    }
  };

  const getLink = (url?: string) => {
    if (isInternalLink(url)) {
      const pathname = url?.replace(window.location.origin, '') || '';
      const pathnameWithoutLocale = removeUrlLocale(pathname);
      return pathnameWithoutLocale;
    }
    return url;
  };

  const theme = useTheme();
  const isSmallerThanTablet = useBreakpoint('tablet');
  const lоcalize = useLocalize();
  const isSmallerThanSmallTablet = useBreakpoint('tablet');

  return (
    <Box bg={colors.background} data-cy="e2e-highlight">
      <Box
        maxWidth="1200px"
        margin="0 auto"
        pt={isSmallerThanTablet ? DEFAULT_PADDING : '40px'}
        pb={isSmallerThanTablet ? DEFAULT_PADDING : '40px'}
        px={isSmallerThanTablet ? DEFAULT_PADDING : '0px'}
      >
        <Container>
          <Box flex="1 1 auto">
            <Title fontSize="xxl" color="tenantText">
              {lоcalize(title)}
            </Title>
            <Text color="textSecondary" maxWidth="400px">
              {lоcalize(description)}
            </Text>
          </Box>
          <ButtonContainer>
            {((enabled && secondaryButtonText) ||
              (secondaryButtonLink && secondaryButtonText)) && (
              <Button
                fontWeight="500"
                padding="13px 22px"
                buttonStyle="text"
                textColor={theme.colors.tenantPrimary}
                textDecorationHover="underline"
                fullWidth={isSmallerThanSmallTablet}
                linkTo={getLink(secondaryButtonLink)}
                scrollToTop
                openLinkInNewTab={openInNewTab(secondaryButtonLink)}
              >
                {lоcalize(secondaryButtonText)}
              </Button>
            )}
            {((enabled && primaryButtonText) ||
              (primaryButtonLink && primaryButtonText)) && (
              <StyledPrimaryButton
                fontWeight="500"
                linkTo={getLink(primaryButtonLink)}
                scrollToTop
                buttonStyle="primary"
                padding="13px 22px"
                openLinkInNewTab={openInNewTab(primaryButtonLink)}
              >
                {lоcalize(primaryButtonText)}
              </StyledPrimaryButton>
            )}
          </ButtonContainer>
        </Container>
      </Box>
    </Box>
  );
};

const HighlightSettings = () => {
  const { formatMessage } = useIntl();
  const {
    actions: { setProp },
    title,
    description,
    primaryButtonText,
    primaryButtonLink,
    secondaryButtonText,
    secondaryButtonLink,
  } = useNode((node) => ({
    title: node.data.props.title,
    description: node.data.props.description,
    primaryButtonText: node.data.props.primaryButtonText,
    primaryButtonLink: node.data.props.primaryButtonLink,
    secondaryButtonText: node.data.props.secondaryButtonText,
    secondaryButtonLink: node.data.props.secondaryButtonLink,
  }));
  return (
    <Box
      background="#ffffff"
      my="20px"
      display="flex"
      flexDirection="column"
      gap="16px"
    >
      <InputMultilocWithLocaleSwitcher
        id="highlight_title"
        type="text"
        label={formatMessage(messages.highlightTitleLabel)}
        name="highlight_title"
        valueMultiloc={title}
        onChange={(valueMultiloc) =>
          setProp((props) => (props.title = valueMultiloc))
        }
      />
      <InputMultilocWithLocaleSwitcher
        id="highlight_description"
        type="text"
        label={formatMessage(messages.highlightDescriptionLabel)}
        name="highlight_description"
        valueMultiloc={description}
        onChange={(valueMultiloc) =>
          setProp((props) => (props.description = valueMultiloc))
        }
      />
      <InputMultilocWithLocaleSwitcher
        id="highlight_primaryButtonText"
        type="text"
        label={formatMessage(messages.highlightPrimaryButtonTextLabel)}
        name="highlight_primaryButtonText"
        valueMultiloc={primaryButtonText}
        onChange={(valueMultiloc) =>
          setProp((props) => (props.primaryButtonText = valueMultiloc))
        }
      />
      <Input
        id="highlight_primaryButtonLink"
        type="text"
        label={formatMessage(messages.highlightPrimaryButtonLinkLabel)}
        placeholder={formatMessage(
          messages.highlightPrimaryButtonLinkPlaceholder
        )}
        name="highlight_primaryButtonLink"
        value={primaryButtonLink}
        onChange={(value) =>
          setProp((props) => (props.primaryButtonLink = value))
        }
      />
      <InputMultilocWithLocaleSwitcher
        id="highlight_secondaryButtonText"
        type="text"
        label={formatMessage(messages.highlightSecondaryButtonTextLabel)}
        name="highlight_secondaryButtonText"
        valueMultiloc={secondaryButtonText}
        onChange={(valueMultiloc) =>
          setProp((props) => (props.secondaryButtonText = valueMultiloc))
        }
      />
      <Input
        id="highlight_secondaryButtonLink"
        type="text"
        label={formatMessage(messages.highlightSecondaryButtonLinkLabel)}
        placeholder={formatMessage(
          messages.highlightSecondaryButtonLinkPlaceholder
        )}
        name="highlight_secondaryButtonLink"
        value={secondaryButtonLink}
        onChange={(value) =>
          setProp((props) => (props.secondaryButtonLink = value))
        }
      />
    </Box>
  );
};

Highlight.craft = {
  related: {
    settings: HighlightSettings,
  },
  custom: {
    title: messages.highlightTitle,
    noPointerEvents: true,
  },
};

export default Highlight;
