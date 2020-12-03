module Roles
  module RoleMappable
    extend ActiveSupport::Concern

    private

    #
    # Returns the role name for the route
    #
    # Example:
    #
    #  /users/project_moderators
    #
    #  p role_name
    #  # => 'project_moderator'
    #
    def role_name
      @role_name ||= Roles::RoleMapping.role_for_route(request.path)
    end

    #
    # Returns the roled resource name.
    #
    # Example:
    #
    #  /users/project_moderators
    #
    #  p roled_resource_name
    #  # => 'users'
    #
    def roled_resource_name
      @roled_resource_name ||= Roles::RoleMapping.resource_for_route(request.path)
    end

    #
    # Returns the roled resource class.
    #
    # Example:
    #
    #  /users/project_moderators
    #
    #  p roled_resource_class
    #  # => User
    #
    def roled_resource_class
      roled_resource_name.singularize.classify.safe_constantize
    end

    #
    # Returns the the mapping of the role, given the roled_resource_class and role_name.
    #
    # Example:
    #
    #  /users/project_moderators
    #
    #  p role_mapping
    #  # => <Roles::RoleMapping @klass=User @role_name="project_moderator">
    #
    def role_mapping
      @role_mapping ||= Roles::RoleMapping.new(roled_resource_class, role_name)
    end

    #
    # Returns the name of the roled_resource suffixed by _id
    #
    # Example:
    #
    #  /users/project_moderators
    #
    #  p roled_resource_primary_key
    #  # => 'user_id'
    #
    def roled_resource_primary_key
      role_mapping.roled_resource_primary_key
    end

    #
    # Returns the param keys permitted for the role.
    #
    # Example:
    #
    #  /users/project_moderators
    #
    #  p role_params_permitted_keys
    #  # => ['user_id', 'project_id']
    #
    def role_params_permitted_keys
      role_mapping.permitted_params
    end

    #
    # Returns base scope to search roled objects by.
    #
    # Example:
    #
    #  /users/project_moderators
    #
    #  Roles.eager_load = { users: { project_moderators: [:unread_notifications] }}
    #
    #  roled_base_scope
    #  # => User.includes([:unread_notifications])
    #
    def roled_base_scope
      if role_mapping.eager_load
        roled_resource_class.includes(role_mapping.eager_load)
      else
        roled_resource_class
      end
    end
  end
end
