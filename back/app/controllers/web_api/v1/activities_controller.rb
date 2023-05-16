# frozen_string_literal: true

class WebApi::V1::ActivitiesController < ApplicationController
  before_action :set_post_type_and_id
  skip_after_action :verify_policy_scoped
  skip_before_action :authenticate_user, only: %i[index]

  def index
    activities = ActivitiesFinder.new(
      finder_params,
      includes: :user,
      scope: policy_scope(Activity)
    ).find_records
    paginated_activities = paginate activities

    render json: linked_json(
      paginated_activities,
      WebApi::V1::ActivitySerializer,
      params: jsonapi_serializer_params,
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
end
