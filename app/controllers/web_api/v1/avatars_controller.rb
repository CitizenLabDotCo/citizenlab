class WebApi::V1::AvatarsController < ApplicationController

  skip_after_action :verify_policy_scoped

  def index
    limit = [params[:limit]&.to_i || 5, 10].min

    users = policy_scope(User).active

    case params[:context_type]
    when 'project'
      project = Project.find(params[:context_id])
      authorize project, :show?
      users = users
        .joins(:ideas)
        .where(ideas: {project: project.id})
    when 'group'
      group = Group.find(params[:context_id])
      authorize group, :show?
      users = users.merge(group.members)
    end

    @users_count = users.count

    @users_with_avatars = users
      .where.not(avatar: nil)
      .limit(limit)
      .order(Arel.sql('random()'))

    render json: @users_with_avatars, each_serializer: WebApi::V1::AvatarSerializer, meta: { total: @users_count }
  end

  private

  def secure_controller?
    false
  end
end
