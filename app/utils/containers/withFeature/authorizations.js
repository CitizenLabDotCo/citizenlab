const authorizations = {
  feature: {
    check: (base) => {
      return base && base.get('allowed') && base.get('enabled')
    },
  },
  withoutFeature: {
    check: () => true,
  },
};

export default authorizations;
