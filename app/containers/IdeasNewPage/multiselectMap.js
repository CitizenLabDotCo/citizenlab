import React from 'react';
import T from 'containers/T';

export default (arrayImm) => (arrayImm
    ? arrayImm.toJS().map((element) => ({
      value: element.id,
      key: element.id,
      text: JSON.stringify(element.attributes.title_multiloc),
      content: <T value={element.attributes.title_multiloc} />,
    }))
    : []
);
