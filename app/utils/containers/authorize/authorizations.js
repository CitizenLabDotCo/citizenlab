const authorizations = {
  comments: {
    create: {
      check: (user, resource) => !!user,
    },
    delete: (user, resource) => {
      if (!user) return false;

      const isUserAdmin = user && user.getIn(['attributes', 'roles']).some((role) => role === 'admin');
      if (isUserAdmin) return true;

      const authorId = resource && resource.getIn(['relationships', 'author', 'data', 'id']);
      const userId = user && user.get('id');
      return (authorId === userId);
    },
  },
};

export default authorizations;
