class WebApi::V1::MentionsController < ApplicationController

  skip_after_action :verify_authorized, only: [:users]

  skip_after_action 
  def users
    service = MentionService.new
    slug_service = SlugService.new
    limit = params[:limit]&.to_i || 5

    mention_pattern = slug_service.slugify(params[:mention])

    @users = []
    if params[:post_id] && params[:post_type]
      post_class = case params[:post_type]
        when 'Idea' then Idea
        when 'Initiative' then Initiative
        else raise "#{params[:post_type]} is not a post type"
      end
      post = post_class.find(params[:post_id])
      @users = service.users_from_post mention_pattern, post, limit
    end

    if @users.size < limit
      @users += User
        .where("slug ILIKE ?", "#{mention_pattern}%")
        .limit(limit - @users.size)
        .where.not(id: @users)
        .all
    end

    render json: @users, each_serializer: WebApi::V1::External::UserSerializer
  end

  def secure_controller?
    false
  end
end
