import messages from './messages';

const craftComponentNameMap = {
  Container: {
    message: messages.oneColumn,
  },
};

export const getComponentNameMessage = (componentName: string) => {
  return craftComponentNameMap[componentName].message;
};
