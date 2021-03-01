class WebApi::V1::ActivitiesController < ApplicationController
  before_action :set_post_type_and_id
  skip_after_action :verify_policy_scoped

  def index
    @activities = ActivitiesFinder.find(finder_params, includes: :user, authorize_with: current_user).records

    render json: linked_json(
      @activities,
      WebApi::V1::ActivitySerializer,
      params: fastjson_params,
      include: [:user]
    )
  end

  private

  def finder_params
    params.merge(
      post: { id: @post_id, type: @post_type },
      action: %w[published changed_status changed_title changed_body]
    )
  end

  def set_post_type_and_id
    @post_type = params[:post]
    @post_id = params[:"#{@post_type.underscore}_id"]
  end

  def secure_controller?
    false
  end
end
