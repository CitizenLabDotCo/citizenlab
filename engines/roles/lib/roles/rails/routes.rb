module ActionDispatch::Routing
  class Mapper
    def roles_for(*roled_resources)
      options = roled_resources.extract_options!

      roled_resources.each do |roled_resource|
        roled_resource_roles(roled_resource).each do |role_name|
          next if should_skip_role?(role_name, options)

          scope path: roled_resource do
            params = { roled: roled_resource_class(roled_resource).name, role_name: role_name }
            resources(role_name.to_s.pluralize, controller: '/roles/roles', only: %i[index update destroy], **params)
          end
        end
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
