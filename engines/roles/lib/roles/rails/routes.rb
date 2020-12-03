module ActionDispatch::Routing
  class Mapper
    def roles_for(*roled_resources)
      options = roled_resources.extract_options!

      roled_resources.each do |roled_resource|
        roled_resource_roles(roled_resource).each do |role_name|
          add_role_routes(role_name, roled_resource, options)
        end
      end
    end

    def add_role_routes(role_name, roled_resource, options)
      return if should_skip_role?(role_name, options)

      path         = options.dig(:path) == '/' ? '' : options.dig(:path)
      route_prefix = path || roled_resource
      role         = role_name.to_s.pluralize.to_sym

      scope path: route_prefix do
        resources(role, controller: '/roles/roles', only: %i[index create destroy])
        Roles::RoleMapping.add_routes({ "#{route_prefix}/#{role}" => { roled: roled_resource.to_sym, role: role } })
      end
    end

    def should_skip_role?(role, options)
      (options.key?(:skip) && options.dig(:skip).include?(role.to_sym)) ||
        (options.key?(:only) && !options.dig(:only).include?(role.to_sym))
    end

    def roled_resource_class(roled_resource)
      roled_resource.to_s.singularize.classify.safe_constantize
    end

    def roled_resource_roles(roled)
      roled_resource_class(roled).roles.keys
    end
  end
end
