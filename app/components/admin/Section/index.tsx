import styled from 'styled-components';

export const Section = styled.div`
  margin-bottom: 110px;
`;

export const SectionTitle = styled.h1`
  color: #333;
  font-size: 28px;
  line-height: 32px;
  font-weight: 500;
  margin: 0;
  margin-bottom: 30px;
  padding: 0;
`;

export const SectionField = styled.div`
  margin-bottom: 35px;

  input,
  textarea {
    max-width: 500px;
  }

  .editor {
    max-width: 600px;
  }

  .Select {
    max-width: 470px;
  }
`;
