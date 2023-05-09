# frozen_string_literal: true

class WebApi::V1::MentionsController < ApplicationController
  skip_before_action :authenticate_user
  skip_after_action :verify_authorized, only: :users

  def users
    limit = params[:limit]&.to_i || 5
    query = params[:mention].gsub(/\W/, "\s")

    @users = []
    if (post_id = params[:post_id]) && (post_type = params[:post_type])
      post_class = post_type_to_class(post_type)
      post = post_class.find(post_id)
      @users = MentionService.new.users_from_post(query, post, limit)
    end

    nb_missing_users = limit - @users.size
    if nb_missing_users > 0
      @users += User.by_username(query).where.not(id: @users).limit(nb_missing_users)
    end

    render json: WebApi::V1::UserSerializer.new(
      @users,
      params: fastjson_params
    ).serializable_hash.to_json
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
