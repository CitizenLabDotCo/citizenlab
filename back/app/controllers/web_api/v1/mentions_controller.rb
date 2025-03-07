# frozen_string_literal: true

class WebApi::V1::MentionsController < ApplicationController
  skip_before_action :authenticate_user
  skip_after_action :verify_authorized, only: :users
  before_action :validate_roles_param

  VALID_ROLES = %w[admin moderator].freeze

  def users
    limit = params[:limit]&.to_i || 5
    query = params[:mention].gsub(/\W/, "\s")
    idea = Idea.find_by(id: params[:idea_id])

    @users = []
    @users = MentionService.new.users_from_idea(query, idea, limit) if idea && params[:roles].nil?

    nb_missing_users = limit - @users.size
    @users += find_users_by_query(query, idea).limit(nb_missing_users) if nb_missing_users.positive?
    @users = @users.excluding(current_user)

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

  # @param [String] query
  # @param [Idea, nil] post
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
