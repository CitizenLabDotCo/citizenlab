# frozen_string_literal: true

class WebApi::V1::ExperimentsController < ApplicationController
  def index
    @experiments = policy_scope(Experiment)
      .order(created_at: :desc)

    render json: linked_json(@experiments, WebApi::V1::ExperimentSerializer, params: jsonapi_serializer_params)
  end

  def create
    @experiment = Experiment.new permitted_attributes(Experiment)
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
end