module Volunteering::VolunteeringParticipationContext
  extend ActiveSupport::Concern

  included do
    has_many :causes, class_name: 'Volunteering::Cause', as: :participation_context, dependent: :destroy

    # for timeline projects, the phases are the participation contexts, so nothing applies
    with_options unless: :timeline_project? do
      validate :causes_allowed_in_participation_method
    end
  end

  def volunteering?
    self.participation_method == 'volunteering'
  end

  private

  def causes_allowed_in_participation_method
    if !volunteering? && causes.present?
      errors.add(:base, :cannot_contain_causes, causes_count: causes.size, message: 'cannot contain causes in the current non-volunteering participation context')
    end
  end
end
