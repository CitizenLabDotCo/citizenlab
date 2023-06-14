# frozen_string_literal: true

class WebApi::V1::MentionsController < ApplicationController
  skip_before_action :authenticate_user
  skip_after_action :verify_authorized, only: :users

  def users
    limit = params[:limit]&.to_i || 5
    query = params[:mention].gsub(/\W/, "\s")
    roles = set_roles
    post = get_post(params[:post_type], params[:post_id])

    @users = []
    @users = MentionService.new.users_from_post(query, post, limit) if post && roles.empty?

    nb_missing_users = limit - @users.size
    if nb_missing_users > 0
      @users += case roles
      when %w[admin moderator]
        query_scope(query).admin
          .or(query_scope(query).project_moderator(post&.project_id))
          .limit(nb_missing_users)
      when ['admin']
        query_scope(query).admin.limit(nb_missing_users)
      when ['moderator']
        query_scope(query).project_moderator(post&.project_id).limit(nb_missing_users)
      else
        query_scope(query).limit(nb_missing_users)
      end
    end

    render json: WebApi::V1::UserSerializer.new(
      @users,
      params: jsonapi_serializer_params
    ).serializable_hash
  end

  private

  def query_scope(query)
    User.active.by_username(query).where.not(id: @users)
  end

  def set_roles
    roles = []

    # Need to move validation stuff to a better place
    if params[:roles].is_a?(Array)
      raise 'Invalid roles query parameter(s)' unless params[:roles].uniq - %w[admin moderator] == []

      roles = params[:roles].uniq
    end

    roles
  end

  # @param [String] type
  # @@return [Class]
  def post_type_to_class(type)
    case type
    when 'Idea' then Idea
    when 'Initiative' then Initiative
    else raise "#{type} is not a post type"
    end
  end

  def get_post(post_type, post_id)
    post_class = post_type_to_class(post_type) if post_type

    post_class.find(post_id) if post_class && post_id
  end
end
