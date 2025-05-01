# frozen_string_literal: true

class WebApi::V1::CustomFormsController < ApplicationController
  CONSTANTIZER = {
    'Project' => {
      container_class: Project,
      container_id: :project_id
    },
    'Phase' => {
      container_class: Phase,
      container_id: :phase_id
    }
  }

  before_action :set_custom_form, only: %i[show update]

  def show
    render json: ::WebApi::V1::CustomFormSerializer.new(
      @custom_form,
      params: jsonapi_serializer_params,
      include: []
    ).serializable_hash
  end

  def update; end

  def set_custom_form
    # TODO: Check the container type is valid
    container_class = params[:container_type].constantize
    container = container_class.find params[:id]
    authorize container

    @custom_form = CustomForm.find_or_initialize_by participation_context: container
  end
end
