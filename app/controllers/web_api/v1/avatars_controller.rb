class WebApi::V1::AvatarsController < ApplicationController

  skip_after_action :verify_policy_scoped
  before_action :set_avatar, only: [:show]
  
  def index
    avatars_service = AvatarsService.new

    limit = [params[:limit]&.to_i || 5, 10].min
    users = policy_scope(User).active

    avatars = case params[:context_type]
    when 'project'
      project = Project.find(params[:context_id])
      authorize project, :show?
      avatars_service.avatars_for_project(project, users: users, limit: limit)
    when 'group'
      group = Group.find(params[:context_id])
      authorize group, :show?
      avatars_service.avatars_for_group(group, users: users, limit: limit)
    when nil
      avatars_service.avatars_for_tenant(users: users, limit: limit)
    end

    render json: avatars[:users], each_serializer: WebApi::V1::AvatarSerializer, meta: { total: avatars[:total_count] }
  end

  def show
    render json: @user, serializer: WebApi::V1::AvatarSerializer
  end

  private

  def set_avatar
    @user = User.find(params[:id][0..-8])
    authorize @user
  end

  def secure_controller?
    false
  end
end
