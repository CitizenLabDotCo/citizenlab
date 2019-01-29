import React from 'react';
import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';
import { darken } from 'polished';
import T from 'components/T';
import { Multiloc } from 'typings';

const Styles = styled.div`
  max-width: 100%;
  color: ${colors.text};
  font-size: ${fontSizes.large}px;
  font-weight: 300;
  line-height: 27px;

  &:after {
    content: "";
    display: table;
    clear: both;
  }

  h1 {
    font-size: ${fontSizes.xxxl - 2}px;
    line-height: 33px;
    font-weight: 600;
    padding: 0;
    margin: 0;
    margin-bottom: 25px;
  }

  h2 {
    font-size: ${fontSizes.xxl - 2}px;
    line-height: 31px;
    font-weight: 600;
    padding: 0;
    margin: 0;
    margin-top: 5px;
    margin-bottom: 20px;
  }

  h3 {
    font-size: ${fontSizes.xl}px;
    line-height: 26px;
    font-weight: 600;
    margin: 0;
    margin-top: 5px;
    margin-bottom: 15px;
  }

  h4 {
    font-size: ${fontSizes.large}px;
    line-height: 26px;
    font-weight: 600;
    margin: 0;
    margin-top: 5px;
    margin-bottom: 15px;
  }

  p {
    line-height: 27px;
    margin-bottom: 30px;

    &:last-child {
      margin-bottom: 0px;
    }
  }

  a {
    color: ${colors.clBlueDark};
    text-decoration: underline;
    overflow-wrap: break-word;
    word-wrap: break-word;
    word-break: break-all;
    word-break: break-word;
    hyphens: auto;

    &:hover {
      color: ${darken(0.15, colors.clBlueDark)};
      text-decoration: underline;
    }
  }

  ul {
    list-style-type: disc;
  }

  ul, ol {
    list-style-position: outside;
    padding: 0;
    padding-left: 21px;
    margin: 0;
    margin-bottom: 23px;

    li {
      padding: 0;
      padding-top: 7px;
      padding-bottom: 7px;
      margin: 0;

      &:first-child {
        padding-top: 0px;
      }
    }
  }

  strong {
    font-weight: 500;
  }

  .ql-align-right {
    text-align: right;
  }

  .ql-align-center {
    text-align: center;
  }

  img {
    max-width: 100%;
    height: auto;
  }

  iframe {
    max-width: 100%;
  }
`;

interface Props {
  children: JSX.Element | string;
}

const QuillEditedContent = ({ children }: Props) => {
  return (
    <Styles>
      {children}
    </Styles>
  );
};

export default QuillEditedContent;
