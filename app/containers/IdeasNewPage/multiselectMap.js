export default (arrayImm) => (arrayImm
    ? arrayImm.toJS().map((element) => ({
      value: element.id,
      label: JSON.stringify(element.attributes.title_multiloc),
    }))
    : []
);
