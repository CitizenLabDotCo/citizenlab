# frozen_string_literal: true

class WebApi::V1::ActivitiesController < ApplicationController
  skip_before_action :authenticate_user, only: %i[index]

  def index
    @activities = policy_scope(Activity)
    paginated_activities = paginate @activities

    render json: linked_json(
      paginated_activities,
      WebApi::V1::ActivitySerializer,
      params: jsonapi_serializer_params,
      include: [:user]
    )
  end
end
