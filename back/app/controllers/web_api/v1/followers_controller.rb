# frozen_string_literal: true

class WebApi::V1::FollowersController < ApplicationController
  def index
    followers = policy_scope current_user.follows
    followers = followers.where(followable_type: params[:followable_type]) if params.key? :followable_type
    followers = paginate followers.order(created_at: :desc)
    followers = followers.includes(:followable)
    render json: linked_json(followers, WebApi::V1::FollowerSerializer, params: jsonapi_serializer_params, include: [:followable])
  end

  def show
    render json: WebApi::V1::FollowerSerializer.new(follower, params: jsonapi_serializer_params).serializable_hash
  end

  def create
    follower = Follower.new followable_type: followable_type, followable_id: followable_id, user: current_user
    authorize follower

    if follower.save
      sidefx.after_create follower, current_user
      render json: WebApi::V1::FollowerSerializer.new(follower, params: jsonapi_serializer_params).serializable_hash, status: :created
    else
      render json: { errors: follower.errors.details }, status: :unprocessable_entity
    end
  end

  def destroy
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
    return @followable_id if @followable_id

    params_key = case followable_type
    when 'Project'
      :project_id
    when 'ProjectFolders::Folder'
      :project_folder_id
    when 'Idea'
      :idea_id
    when 'GlobalTopic'
      :global_topic_id
    when 'Area'
      :area_id
    else
      raise "Unsupported followable type #{followable_type}"
    end
    @followable_id = params[params_key]
  end

  def sidefx
    @sidefx ||= SideFxFollowerService.new
  end
end
