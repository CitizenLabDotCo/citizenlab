# frozen_string_literal: true

class WebApi::V1::FollowersController < ApplicationController
  def index
    followers = paginate policy_scope(current_user.follows.includes(:followable)).order(created_at: :desc)
    render json: linked_json(followers, WebApi::V1::FollowerSerializer, params: jsonapi_serializer_params, include: [:followable])
  end

  def show
    render json: WebApi::V1::FollowerSerializer.new(follower, params: jsonapi_serializer_params).serializable_hash
  end

  def create
    follower = Follower.new followable_type: followable_type, followable_id: followable_id, user: current_user
    authorize follower

    sidefx.before_create follower, current_user
    if follower.save
      sidefx.after_create follower, current_user
      render json: WebApi::V1::FollowerSerializer.new(follower, params: jsonapi_serializer_params).serializable_hash, status: :created
    else
      render json: { errors: follower.errors.details }, status: :unprocessable_entity
    end
  end

  def destroy
    sidefx.before_destroy follower, current_user
    if follower.destroy
      sidefx.after_destroy follower, current_user
      head :ok
    else
      render json: { errors: follower.errors.details }, status: :unprocessable_entity
    end
  end

  private

  def follower
    @follower ||= Follower.find(params[:id]).tap do |follower|
      authorize follower
    end
  end

  def followable_type
    @followable_type ||= params[:followable]
  end

  def followable_id
    @followable_id ||= params[:"#{followable_type.underscore}_id"]
  end

  def sidefx
    @sidefx ||= SideFxFollowerService.new
  end
end
