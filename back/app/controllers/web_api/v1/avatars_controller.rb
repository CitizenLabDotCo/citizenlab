# frozen_string_literal: true

class WebApi::V1::AvatarsController < ApplicationController
  skip_before_action :authenticate_user
  skip_after_action :verify_policy_scoped
  before_action :set_avatar, only: [:show]

  def index
    avatars_service = AvatarsService.new

    limit = [params[:limit]&.to_i || 5, 10].min
    users = User.active

    avatars = case params[:context_type]
    when 'project'
      project = Project.find(params[:context_id])
      authorize project, :show?
      avatars_service.avatars_for_project(project, users: users, limit: limit)
    when 'project_folder'
      folder = ProjectFolders::Folder.find(params[:context_id])
      authorize folder, :show?
      avatars_service.avatars_for_folder(folder, users: users, limit: limit)
    when 'group'
      group = Group.find(params[:context_id])
      authorize group, :show?
      avatars_service.avatars_for_group(group, users: users, limit: limit)
    when 'idea'
      idea = Idea.find(params[:context_id])
      authorize idea, :show?
      avatars_service.avatars_for_idea(idea, users: users, limit: limit)
    when nil
      avatars_service.some_avatars(users: users, limit: limit)
    end

    render json: {
      **WebApi::V1::AvatarSerializer.new(avatars[:users], params: jsonapi_serializer_params).serializable_hash,
      meta: { total: avatars[:total_count] }
    }
  end

  def show
    render json: WebApi::V1::AvatarSerializer.new(@user, params: jsonapi_serializer_params).serializable_hash
  end

  private

  def set_avatar
    @user = User.find params[:id]
    authorize @user
  end
end
