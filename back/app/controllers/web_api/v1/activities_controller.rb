# frozen_string_literal: true

class WebApi::V1::ActivitiesController < ApplicationController
  skip_before_action :authenticate_user, only: %i[index]

  def index
    activities = policy_scope Activity
    activities = activities.where(user_id: params[:user_ids]) if params[:user_ids]
    activities = activities.where(project_id: params[:project_ids]) if params[:project_ids]

    activities = case params[:sort]
    when 'acted_at'
      activities.order(acted_at: :asc)
    when '-acted_at'
      activities.order(acted_at: :desc)
    when nil
      activities
    else
      raise 'Unsupported sort method'
    end

    paginated_activities = paginate activities
    paginated_activities = paginated_activities.includes(:user)

    render json: linked_json(
      paginated_activities,
      WebApi::V1::ActivitySerializer,
      params: jsonapi_serializer_params,
      include: %i[user item]
    )
  end
end
