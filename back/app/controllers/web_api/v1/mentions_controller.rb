# frozen_string_literal: true

class WebApi::V1::MentionsController < ApplicationController
  skip_before_action :authenticate_user
  skip_after_action :verify_authorized, only: :users

  def users
    @users = UserSearchService.new.search(
      params[:mention],
      idea_id: params[:idea_id],
      moderators_only: parse_bool(params[:moderators_only]),
      limit: params[:limit]&.to_i || 5,
      exclude_user: current_user
    )

    render json: WebApi::V1::UserSerializer.new(
      @users,
      params: jsonapi_serializer_params
    ).serializable_hash
  end
end
