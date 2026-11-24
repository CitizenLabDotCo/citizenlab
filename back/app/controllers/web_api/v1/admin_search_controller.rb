# frozen_string_literal: true

# Everything the admin quick search can find, in one small response: the
# projects (with their phases), folders and spaces the user manages.
class WebApi::V1::AdminSearchController < ApplicationController
  def index
    authorize :admin_search, :index?

    role_service = UserRoleService.new
    projects = role_service.moderatable_projects(current_user)
      .not_hidden
      .includes(:phases, admin_publication: { parent: :publication })
    folders = role_service.moderatable_folders(current_user)
    spaces = policy_scope(Space)
    spaces = spaces.none unless AppConfiguration.instance.feature_activated?('spaces')

    render json: {
      data: [
        *WebApi::V1::ProjectAdminSearchSerializer.new(projects).serializable_hash[:data],
        *WebApi::V1::FolderAdminSearchSerializer.new(folders).serializable_hash[:data],
        *WebApi::V1::SpaceAdminSearchSerializer.new(spaces).serializable_hash[:data]
      ]
    }
  end
end
