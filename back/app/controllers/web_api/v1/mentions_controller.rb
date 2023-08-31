# frozen_string_literal: true

class WebApi::V1::MentionsController < ApplicationController
  skip_before_action :authenticate_user
  skip_after_action :verify_authorized, only: :users
  before_action :validate_roles_param

  VALID_ROLES = %w[admin moderator].freeze

  def users
    limit = params[:limit]&.to_i || 5
    query = params[:mention].gsub(/\W/, "\s")
    post = find_post(params[:post_type], params[:post_id])

    @users = []
    @users = MentionService.new.users_from_post(query, post, limit, current_user) if post && params[:roles].nil?

    nb_missing_users = limit - @users.size
    if nb_missing_users.positive?
      @users += if current_user
        find_users_by_query(query, post).where.not(id: current_user.id).limit(nb_missing_users)
      else
        find_users_by_query(query, post).limit(nb_missing_users)
      end
    end

    render json: WebApi::V1::UserSerializer.new(
      @users,
      params: jsonapi_serializer_params
    ).serializable_hash
  end

  private

  def validate_roles_param
    return unless params[:roles]

    raise 'Roles query parameter should be an array' unless params[:roles].is_a?(Array)
    raise 'Invalid roles query parameter(s)' unless params[:roles].uniq - VALID_ROLES == []
  end

  # @param [String] post_type
  # @param [String] post_id
  # @return [Idea, Initiative, nil]
  def find_post(post_type, post_id)
    post_class = post_type_to_class(post_type) if post_type
    post_class&.find(post_id)
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

  # @param [String] query
  # @param [Idea, Initiative, nil] post
  # @return [ActiveRecord::Relation]
  def find_users_by_query(query, post)
    case params[:roles]&.uniq
    when %w[admin moderator], %w[moderator admin]
      query_scope(query).admin.or(query_scope(query).project_moderator(post&.project_id))
    when ['admin']
      query_scope(query).admin
    when ['moderator']
      query_scope(query).project_moderator(post&.project_id)
    else
      query_scope(query)
    end
  end

  # @param [String] query
  # @return [ActiveRecord::Relation]
  def query_scope(query)
    User.active.by_username(query).where.not(id: @users)
  end
end
