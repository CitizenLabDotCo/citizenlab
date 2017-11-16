class Api::V1::MentionsController < ApplicationController

  skip_after_action :verify_authorized, only: [:users]

  skip_after_action 
  def users
    service = MentionService.new
    limit = 5

    @users = []
    if (params[:idea_id])
      idea = Idea.find(params[:idea_id])
      @users = service.users_from_idea params[:mention], idea, limit
    end

    if @users.size < limit
      @users += User
        .where("slug ILIKE ?", "#{params[:mention]}%")
        .limit(limit - @users.size)
        .where.not(id: @users.map(&:id))
        .all
    end


    render json: @users, each_serializer: Api::V1::External::UserSerializer
  end

  def secure_controller?
    false
  end
end
