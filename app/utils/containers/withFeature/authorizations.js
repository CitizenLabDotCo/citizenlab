const authorizations = {
  feature: {
    check: (base) => base && base.get('allowed') && base.get('enabled'),
  },
  withoutFeature: {
    check: () => true,
  },
};

export default authorizations;
