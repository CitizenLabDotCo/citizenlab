const userIs = (user, role) => user && user.getIn(['attributes', 'roles']).some((ro) => ro.get('type') === role);

const authorizations = {
  comments: {
    create: {
      check: (user) => !!user,
    },
    delete: (user, resource) => {
      if (!user) return false;

      const isUserAdmin = user && user.getIn(['attributes', 'roles']).some((role) => role.get('type') === 'admin');
      if (isUserAdmin) return true;

      const authorId = resource && resource.getIn(['relationships', 'author', 'data', 'id']);
      const userId = user && user.get('id');
      return (authorId === userId);
    },
  },
  users: {
    admin: {
      check: (user) => userIs(user, 'admin'),
    },
  },
  routes: {
    admin: {
      check: (user, resource) => {
        const isAdmin = userIs(user, 'admin');
        const paths = resource.split('/').slice(1);
        if (paths[0] === 'admin') {
          return isAdmin;
        } else if (paths[0] === 'register' && paths[1] === 'complete') {
          return !!user;
        } else if (paths[0] === 'profile' && paths[1] === 'edit') {
          return !!user;
        }
        return true;
      },
    },
  },
};

export default authorizations;
