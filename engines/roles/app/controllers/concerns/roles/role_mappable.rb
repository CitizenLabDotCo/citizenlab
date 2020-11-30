module Roles
  module RoleMappable
    extend ActiveSupport::Concern

    private

    def role_name
      @role_name ||= request.path.gsub('/web_api/v1/', '').split('/').second.singularize
    end

    def roled_resource_name
      @roled_resource_name ||= request.path.gsub('/web_api/v1/', '').split('/').first
    end

    def roled_resource_class
      roled_resource_name.singularize.classify.safe_constantize
    end

    def role_mapping
      @role_mapping ||= Roles::RoleMapping.new(roled_resource_class, role_name)
    end

    def roled_resource_primary_key
      role_mapping.roled_resource_primary_key
    end

    def role_association_foreign_key
      role_mapping.role_association_foreign_key
    end

    def role_association_name
      role_mapping.association_name
    end

    def role_params_permitted_keys
      role_mapping.permitted_params
    end

    def find_roleable(id)
      role_mapping.find_roleable(id)
    end

    def roleable_id
      @roleable_id ||= role_params.dig(role_mapping.roleable_primary_key(namespace: false))
    end
  end
end
