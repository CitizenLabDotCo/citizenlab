# frozen_string_literal: true

# Call-time enforcement of the feature gates that used to be encoded in create_phase's
# input schema. The schema now advertises the union of participation methods,
# prescreening modes and dislike fields on every tenant (so tool definitions stay
# tenant-agnostic, see tool_definitions_parity_spec); inputs that conflict with the
# platform's features are rejected here with an error naming the missing feature.
# Included by the create_phase and update_phase runners.
module McpServer::PhaseFeatureGuard
  DISLIKE_PARAMS = %i[reacting_dislike_enabled reacting_dislike_method reacting_dislike_limited_max].freeze

  private

  def phase_feature_conflict(params)
    participation_method_conflict(params) || prescreening_conflict(params) || disliking_conflict(params)
  end

  def participation_method_conflict(params)
    flag = McpServer::Tools::CreatePhase::GATED_METHODS[params[:participation_method]]
    return if flag.nil? || AppConfiguration.instance.feature_activated?(flag)

    "Participation method '#{params[:participation_method]}' requires the '#{flag}' feature, " \
      'which is not enabled on this platform.'
  end

  def prescreening_conflict(params)
    return if params[:prescreening_mode].nil?

    config = AppConfiguration.instance
    unless config.feature_activated?('prescreening') || config.feature_activated?('prescreening_ideation')
      return "prescreening_mode requires the 'prescreening' or 'prescreening_ideation' feature, " \
             'neither of which is enabled on this platform.'
    end

    return if params[:prescreening_mode] != 'flagged_only' || config.feature_activated?('flag_inappropriate_content')

    "prescreening_mode 'flagged_only' requires the 'flag_inappropriate_content' feature, " \
      'which is not enabled on this platform.'
  end

  def disliking_conflict(params)
    return unless DISLIKE_PARAMS.intersect?(params.keys)
    return if AppConfiguration.instance.feature_activated?('disable_disliking')

    "The reacting_dislike_* fields require the 'disable_disliking' feature, " \
      'which is not enabled on this platform.'
  end
end
