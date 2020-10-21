# frozen_string_literal: true

#
# Controller of Idea Statuses
#
#   Base url:
#     /web_api/v1/idea_statuses
#
class WebApi::V1::IdeaStatusesController < ApplicationController
  tricks SerializesControllerResource

  before_action :set_idea_status, except: %i[index create]

  serialize_resource :idea, params: :some_param

  def index
    @idea_statuses = policy_scope(IdeaStatus)
    render json: serialized_resource, status: :ok
  end

  def show
    render json: serialized_resource, status: :ok
  end

  def create
    @idea_status = IdeaStatus.new(idea_status_params)
    authorize @idea_status
    if @idea_status.save
      render json: serialized_resource, status: :ok
    else
      render json: serialized_resource_errors, status: :unprocessable_entity
    end
  end

  def update
    @idea_status.insert_at(params.dig(:idea_status, :ordering)) if params.dig(:idea_status, :ordering)
    if @idea_status.update(idea_status_params)
      render json: serialized_resource, status: :ok
    else
      render json: serialized_resource_errors, status: :unprocessable_entity
    end
  end

  def destroy
    if @idea_status.destroy
      head :no_content
    else
      render serialized_resource_errors, status: :not_allowed
    end
  end

  private

  def set_idea_status
    @idea_status = IdeaStatus.find(params[:id])
    authorize @idea_status
  end

  def secure_controller?
    false
  end

  def idea_status_params
    params.require(:idea_status).permit(
      :code, :color,
      title_multiloc: CL2_SUPPORTED_LOCALES,
      description_multiloc: CL2_SUPPORTED_LOCALES
    )
  end
end
