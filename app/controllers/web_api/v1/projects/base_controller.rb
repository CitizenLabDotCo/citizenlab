# frozen_string_literal: true

#
# The base controller of all Project child Controllers.
#
class WebApi::V1::Projects::BaseController < ApplicationController
  before_action :set_project

  private

  def set_project
    @project = Project.find(params[:project_id])
    authorize @project
  end

  def serialized_project(**options)
    WebApi::V1::ProjectSerializer.new(@project, params: fastjson_params, **options).serialized_json
  end

  def serialized_project_errors
    { errors: @project.errors.details }
  end
end
