class WebApi::V1::AvatarsController < ApplicationController

  skip_after_action :verify_policy_scoped

  def index
    limit = [params[:limit] || 5, 10].min

    @users = policy_scope(User)
      .where.not(avatar: nil)
      .limit(limit)
      .order(Arel.sql('random()'))

    render json: @users, each_serializer: WebApi::V1::AvatarSerializer
  end

  private

  def secure_controller?
    false
  end
end
