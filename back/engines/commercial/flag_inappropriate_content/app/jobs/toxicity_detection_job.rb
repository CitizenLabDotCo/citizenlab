# frozen_string_literal: true

class ToxicityDetectionJob < ApplicationJob
  queue_as :default

  def run(flaggable, options = {})
    flag = FlagInappropriateContent::ToxicityDetectionService.new.flag_toxicity!(flaggable, **options)

    # If 'prescreening_flagged_only' is enabled, automatically hide ideas that are flagged
    # for inappropriate content.
    return unless flag
    return unless flaggable.is_a?(Idea)
    return unless flaggable.creation_phase&.prescreening_flagged_only?

    prescreening_status = IdeaStatus.find_by!(
      code: 'prescreening',
      participation_method: flaggable.participation_method_on_creation.idea_status_method
    )

    # Set both explicitly - no automatic callback for hiding published ideas
    flaggable.update!(
      idea_status: prescreening_status,
      publication_status: 'submitted'
    )
  end
end
