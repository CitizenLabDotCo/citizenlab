module Polls::PollParticipationContext
  extend ActiveSupport::Concern

  included do
    has_many :poll_questions, class_name: 'Polls::Question', as: :participation_context, dependent: :destroy
    has_many :poll_responses, class_name: 'Polls::Response', as: :participation_context, dependent: :destroy

	  # for timeline projects, the phases are the participation contexts, so nothing applies
    with_options unless: :is_timeline_project? do
      validate :poll_questions_allowed_in_participation_method
    end
  end

  def poll?
    self.participation_method == 'poll'
  end

  def poll_questions_allowed_in_participation_method
    if !poll? && poll_questions.present?
      errors.add(:base, :cannot_contain_poll_questions, questions_count: poll_questions.size, message: 'cannot contain poll questions in the current non-poll participation context')
    end
  end
end