# frozen_string_literal: true

class WebApi::V1::ParticipationContextsController < ::ApplicationController
  before_action :set_context_no_clash, only: %i[survey_results submission_count delete_inputs]

  def survey_results
    results = SurveyResultsGeneratorService.new(@context).generate_results
    render json: results
  end

  def submission_count
    count = SurveyResultsGeneratorService.new(@context).generate_submission_count
    render json: count
  end

  def delete_inputs
    sidefx.before_delete_inputs @context, current_user
    ActiveRecord::Base.transaction do
      @context.ideas.each(&:destroy!)
    end
    sidefx.before_delete_inputs @context, current_user
    head :ok
  end

  private

  def set_context_no_clash
    set_context
  end
end
