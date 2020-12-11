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

    def roled_resource_primary_key
      [roled_resource_name.singularize, 'id'].join('_')
    end

    def role_association_foreign_key
      [role_association_name, 'id'].join('_')
    end

    def role_association_name
      role_mapping.association_name(namespace: false)
    end

    def role_params_permitted_keys
      role_mapping.permitted_params
    end

    def role_mapping
      @role_mapping ||= Roles::RoleMapping.new(roled_resource_class, role_name)
    end

    def find_roleable(id)
      role_mapping.find_roleable(id)
    end

    def find_roled_resource
      @roled_resource = roled_resource
      authorize(@roled_resource, policy_class: policy_class) if policy_present?
    end

    def roled_resource
      byebug
      if params.key?(role_association_name)
        roled_resource_class.find(role_params[roled_resource_primary_key])
      else
        roled_resource_class.find(params[:id])
      end
    end

    def scoped_resources
      if params.key?(role_association_foreign_key)
        roled_resource_class.send(role_name, params[role_association_foreign_key])
      else
        roled_resource_class.send(role_name)
      end
    end

    def role_params
      params.require(role_association_name).permit(*role_params_permitted_keys)
    end

    def roleable_id
      @roleable_id ||= role_params.dig(config.roleable_primary_key)
    end

    def roleable
      @roleable ||= find_roleable(roleable_id)
    end
  end
end
