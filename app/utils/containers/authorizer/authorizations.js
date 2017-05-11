const authorizations = {
  comments: {
    create: {
      check: (resource, user) => !!user,
    },
    delete: (resource, user) => {
      if (!user) return false;

      const isUserAdmin = user && user.getIn(['attributes', 'roles']).some((role) => role === 'admin');
      if (isUserAdmin) return true;

      const authorId = resource && resource.getIn(['relationships', 'author', 'data', 'id']);
      const userId = user && user.get('id');
      return (authorId === userId);
    },
  },
};

export authorizations;