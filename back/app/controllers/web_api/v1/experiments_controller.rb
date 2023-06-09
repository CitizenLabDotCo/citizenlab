# frozen_string_literal: true

class WebApi::V1::ExperimentsController < ApplicationController
  skip_before_action :authenticate_user, only: %i[create]

  def index
    @experiments = policy_scope(Experiment)
      .order(created_at: :desc)
    @experiments = paginate @experiments

    render json: linked_json(@experiments, WebApi::V1::ExperimentSerializer, params: jsonapi_serializer_params)
  end

  def create
    @experiment = Experiment.new(experiment_params)
    authorize @experiment

    if @experiment.save
      render json: ::WebApi::V1::ExperimentSerializer.new(
        @experiment,
        params: jsonapi_serializer_params
      ).serializable_hash, status: :created
    else
      render json: { errors: @experiment.errors.details }, status: :unprocessable_entity
    end
  end

  private

  def experiment_params
    params.require(:experiment).permit(
      :name,
      :treatment,
      :payload,
      :user_id
    )
  end
end