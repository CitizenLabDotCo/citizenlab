module Permissions
  class ActionDescriptorsService
    # Reasons that can be 'fixed' by the user. Somewhat subjective, and sometimes misleading,
    # since 'fixing' a reason may subsequently reveal another 'unfixable' reason.
    # Attempting to predict if a user could theoretically fix a 'stack' of denied reasons for an action
    # is complex, could be slow, and in some cases impossible.
    FIXABLE_DENIED_REASONS = %w[user_not_signed_in user_not_active user_not_verified user_missing_requirements].freeze

    def initialize(action_descriptors)
      @action_descriptors = action_descriptors
    end

    def participation_possible?
      action_descriptors.values.any? do |descriptor|
        descriptor[:enabled] || FIXABLE_DENIED_REASONS.include?(descriptor[:disabled_reason])
      end
    end

    private

    attr_reader :action_descriptors
  end
end
