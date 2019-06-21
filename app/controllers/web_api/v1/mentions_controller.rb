class WebApi::V1::MentionsController < ApplicationController

  skip_after_action :verify_authorized, only: [:users]

  skip_after_action 
  def users
    service = MentionService.new
    slug_service = SlugService.new
    limit = 5

    mention_pattern = slug_service.slugify(params[:mention])

    @users = []
    if (params[:idea_id])
      idea = Idea.find(params[:idea_id])
      @users = service.users_from_idea mention_pattern, idea, limit
    end

    if @users.size < limit
      @users += User
        .where("slug ILIKE ?", "#{mention_pattern}%")
        .limit(limit - @users.size)
        .where.not(id: @users.map(&:id))
        .all
    end


    render json: WebApi::V1::Fast::UserSerializer.new(
      @users, 
      params: fastjson_params
      ).serialized_json
  end

  def secure_controller?
    false
  end
end
