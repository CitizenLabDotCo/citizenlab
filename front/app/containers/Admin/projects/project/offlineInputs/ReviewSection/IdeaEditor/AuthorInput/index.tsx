import React from 'react';
import AuthorSelect from './AuthorSelect';
import { Input } from '@citizenlab/cl2-component-library';

import { SelectedAuthor } from './typings';

interface Props {
  selectedAuthor: SelectedAuthor;
  onSelect: (selectedAuthor?: SelectedAuthor) => void;
}

const AuthorInput = ({ selectedAuthor, onSelect }: Props) => {
  if (selectedAuthor.userState !== 'no-user') {
    return <Input disabled type="text" value={selectedAuthor.email} />;
  }

  return <AuthorSelect selectedAuthor={selectedAuthor} onSelect={onSelect} />;
};

export default AuthorInput;
