module Polls::PollParticipationContext
  extend ActiveSupport::Concern

  included do
    has_many :poll_questions, class_name: 'Polls::Question', as: :participation_context, dependent: :destroy
    has_many :poll_responses, class_name: 'Polls::Response', as: :participation_context, dependent: :destroy

	  # for timeline projects, the phases are the participation contexts, so nothing applies
    with_options unless: :timeline_project? do
      validates :poll_anonymous, inclusion: {in: [true, false]}, if: :poll?
      validate :poll_questions_allowed_in_participation_method
      validate :anonymous_immutable_after_responses, on: :update
    end
  end

  def poll?
    self.participation_method == 'poll'
  end

  def poll_anonymous?
    self.poll_anonymous
  end

  private

  def poll_questions_allowed_in_participation_method
    if !poll? && poll_questions.present?
      errors.add(:base, :cannot_contain_poll_questions, questions_count: poll_questions.size, message: 'cannot contain poll questions in the current non-poll participation context')
    end
  end

  def anonymous_immutable_after_responses
    if poll_anonymous_changed? && poll_responses.any?
      errors.add(:poll_anonymous, :cant_change_after_first_response, message: "can't change after the first response came in")
    end
  end
end
