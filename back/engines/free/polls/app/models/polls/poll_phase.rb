# frozen_string_literal: true

module Polls::PollPhase
  extend ActiveSupport::Concern

  included do
    has_many :poll_questions, class_name: 'Polls::Question', dependent: :destroy
    has_many :poll_responses, class_name: 'Polls::Response', dependent: :destroy

    validates :poll_anonymous, inclusion: { in: [true, false] }, if: :poll?
    validate :poll_questions_allowed_in_participation_method
    validate :anonymous_immutable_after_responses, on: :update
  end

  def poll?
    participation_method == 'poll'
  end

  def poll_anonymous?
    poll_anonymous
  end

  private

  def poll_questions_allowed_in_participation_method
    return unless !poll? && poll_questions.present?

    errors.add(:base, :cannot_contain_poll_questions, questions_count: poll_questions.size, message: 'cannot contain poll questions in the current non-poll phase')
  end

  def anonymous_immutable_after_responses
    return unless poll_anonymous_changed? && poll_responses.any?

    errors.add(:poll_anonymous, :cant_change_after_first_response, message: "can't change after the first response came in")
  end
end
