class WebApi::V1::MentionsController < ApplicationController

  skip_after_action :verify_authorized, only: [:users]

  def users
    service = MentionService.new
    slug_service = SlugService.new
    limit = params[:limit]&.to_i || 5

    mention_pattern = slug_service.slugify(params[:mention]).split('-').reject(&:empty?)

    @users = []
    if (post_id = params[:post_id]) && (post_type = params[:post_type])
      post_class = post_type_to_class(post_type)
      post = post_class.find(post_id)
      @users = service.users_from_post mention_pattern, post, limit
    end

    if @users.size < limit
      @users << User.by_username(mention_pattern)
                    .where.not(id: @users)
                    .limit(limit - @users.size)
                    .all
    end

    puts "yolow"
    puts @users.inspect

    render json: WebApi::V1::UserSerializer.new(
        @users,
        params: fastjson_params
    ).serialized_json
  end

  def secure_controller?
    false
  end

  private

  # @param [String] type
  # @@return [Class]
  def post_type_to_class(type)
    case type
    when 'Idea' then Idea
    when 'Initiative' then Initiative
    else raise "#{type} is not a post type"
    end
  end
end
