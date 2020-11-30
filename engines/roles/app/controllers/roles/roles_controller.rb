module Roles
  class RolesController < Roles::ApplicationController
    before_action :find_roled_resource, except: %i[index]

    def index
      @roled_resources = scoped_resources
      @roled_resources = policy_scope(@roled_resources, policy_scope_class: policy_scope_class) if policy_present?
      render json: serialize_resources(@roled_resources), status: :ok
    end

    def create
      publish_before_create
      @roled_resource.send(:"add_#{role_name}_role", roleable)

      if @roled_resource.save
        publish_after_create
        render json: serialize_resources(@roled_resource), status: :ok
      else
        render json: { errors: @roled_resource.errors }, status: :unprocessable_entity
      end
    end

    def destroy
      publish_before_destroy
      @roled_resource.send(:"remove_#{role_name}_role", roleable)

      if @roled_resource.save
        publish_after_destroy
        render json: serialize_resources(@roled_resource), status: :ok
      else
        render json: { errors: @roled_resource.errors }, status: :unprocessable_entity
      end
    end

    private

    def find_roled_resource
      @roled_resource = roled_resource
      authorize([@roled_resource, roleable], policy_class: policy_class) if policy_present?
    end

    #
    # Returns the id of the roleable object from the params.
    #
    #
    # Example:
    #
    #  /users/project_moderators?project_moderator[project_id]=2&project_moderator[user_id]=5
    #
    #  p role_params
    #  # => <ActionController::Paramaters permitted=true project_id=2 user_id=5>
    #
    def role_params
      params.require(role_name).permit(*role_params_permitted_keys)
    end

    #
    # Returns the id of the roleable object from the params.
    #
    #
    # Example:
    #
    #  /users/project_moderators?project_moderator[project_id]=2&project_moderator[user_id]=5
    #
    #  p role_params
    #  # => <Project @id=2>
    #
    #
    def roleable
      id = role_params.dig(role_mapping.roleable_primary_key(namespace: false))
      @roleable ||= role_mapping.find_roleable(id)
    end

    #
    # Returns the id of the roleable object from the params.
    #
    #
    # Example (with user_id in params)
    #
    #  /users/project_moderators?project_moderator[project_id]=2&project_moderator[user_id]=5
    #
    #  p roled_resource
    #  # => <User @id=5>
    #
    #
    #
    # Example (with user id as part of url)
    #
    #  /users/project_moderators/3?project_moderator[project_id]=2
    #
    #  p roled_resource
    #  # => <User @id=3>
    #
    #
    #
    # Example (without use id at all)
    #
    #  /users/project_moderators?project_moderator[project_id]=2
    #
    #  p roled_resource
    #  # => current_user
    #
    def roled_resource
      if params.key?(:id)
        roled_resource_class.find_by_id(params[:id])
      elsif params.key?(role_name)
        roled_resource_class.find_by_id(role_params[roled_resource_primary_key])
      else
        current_user
      end
    end

    #
    # Returns the id of the roleable object from the params.
    #
    #
    # Example (when a project_id is received in params)
    #
    #  /users/project_moderators?project_id=3
    #
    #  p scoped_resources
    #  # => <ActiveRecord::Colection::User> with moderators of project with id = 3
    #
    #
    #
    # Example (without any params)
    #
    #  /users/project_moderators
    #
    #  p scoped_resources
    #  # => <ActiveRecord::Colection::User > with all moderators
    #
    #
    def scoped_resources
      if params.key?(role_association_foreign_key)
        roled_resource_class.send(role_name, params[role_association_foreign_key])
      else
        roled_resource_class.send(role_name)
      end
    end
  end
end
