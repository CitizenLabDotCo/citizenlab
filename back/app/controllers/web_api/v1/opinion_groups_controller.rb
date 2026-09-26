# frozen_string_literal: true

class WebApi::V1::OpinionGroupsController < ApplicationController
  before_action :set_phase

  def show
    options = analysis_options
    result = Rails.cache.fetch(cache_key(options), expires_in: 1.hour) do
      OpinionGroups::AnalysisService.new(@phase, options).call
    end

    render json: WebApi::V1::OpinionGroupsSerializer
      .new(result, params: jsonapi_serializer_params)
      .serializable_hash
  end

  private

  # The analysis is recomputed when the options change or when reactions in
  # the phase change.
  def cache_key(options)
    reactions = Reaction.where(reactable_type: 'Idea', reactable_id: @phase.ideas.select(:id))
    [
      'opinion_groups', @phase.id, options.to_a.flatten.join(':'),
      reactions.count, reactions.maximum(:updated_at)&.to_i
    ]
  end

  def set_phase
    @phase = Phase.find(params[:phase_id])
    authorize @phase, :opinion_groups?
  end

  def analysis_options
    permitted = params.permit(
      :k, :include_demographics, :demographic_weight,
      :min_votes_per_participant, :min_votes_per_statement, :privacy_threshold
    )
    {
      k: integer_param(permitted[:k], min: 1, max: OpinionGroups::KMeans::MAX_K),
      include_demographics: permitted[:include_demographics].to_s == 'true' ? true : nil,
      demographic_weight: float_param(permitted[:demographic_weight], min: 0.0, max: 5.0),
      min_votes_per_participant: integer_param(permitted[:min_votes_per_participant], min: 1, max: 100),
      min_votes_per_statement: integer_param(permitted[:min_votes_per_statement], min: 1, max: 100),
      privacy_threshold: integer_param(permitted[:privacy_threshold], min: 1, max: 100)
    }
  end

  def integer_param(value, min:, max:)
    return nil if value.blank?

    value.to_i.clamp(min, max)
  end

  def float_param(value, min:, max:)
    return nil if value.blank?

    value.to_f.clamp(min, max)
  end
end
