# frozen_string_literal: true

class WebApi::V1::ProjectSpotlightsController < ApplicationController
  # Spotlight summaries used to be computed in the frontend, but now we do it
  # here so the numbers match the admin dashboard.
  def show
    project = Project.find(params[:project_id])
    summary = project.spotlight_summary
    if summary
      render json: summary
    end
    unless summary
      render json: { errors: { base: [{ error: 'could not build the spotlight summary because the project has no participation data yet or the analytics tables are still being backfilled for this tenant' }] } }, status: :unprocessable_entity
    end
  end
end
