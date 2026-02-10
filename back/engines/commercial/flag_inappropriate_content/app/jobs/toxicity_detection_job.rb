# frozen_string_literal: true

class ToxicityDetectionJob < ApplicationJob
  queue_as :default

  def run(flaggable, options = {})
    flag = FlagInappropriateContent::ToxicityDetectionService.new.flag_toxicity!(flaggable, **options)

    return unless flaggable.is_a?(Idea)
    return unless flaggable.creation_phase_with_fallback.prescreening_flagged_only?

    flag ? move_to_prescreening(flaggable) : publish_idea(flaggable)
  end

  private

  def publish_idea(idea)
    return if idea.idea_status.public_post?

    proposed_status = IdeaStatus.find_by!(
      code: 'proposed',
      participation_method: idea.participation_method_on_creation.idea_status_method
    )

    idea.update!(idea_status: proposed_status, publication_status: 'published')
  end

  def move_to_prescreening(idea)
    return if idea.idea_status.code == 'prescreening'

    prescreening_status = IdeaStatus.find_by!(
      code: 'prescreening',
      participation_method: idea.participation_method_on_creation.idea_status_method
    )

    idea.update!(publication_status: 'submitted', idea_status: prescreening_status)
  end
end
