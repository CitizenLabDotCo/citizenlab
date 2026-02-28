# frozen_string_literal: true

# == Schema Information
#
# Table name: polls_responses
#
#  id         :uuid             not null, primary key
#  phase_id   :uuid             not null
#  user_id    :uuid
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  deleted_at :datetime
#
# Indexes
#
#  index_polls_responses_on_deleted_at  (deleted_at)
#  index_polls_responses_on_phase_id    (phase_id)
#  index_polls_responses_on_user_id     (user_id)
#
module Polls
  class Response < ApplicationRecord
    acts_as_paranoid
    belongs_to :user
    belongs_to :phase
    has_many :response_options, class_name: 'Polls::ResponseOption', dependent: :destroy

    validates :user, :phase, presence: true
    validates :user, uniqueness: { scope: [:phase], conditions: -> { where(deleted_at: nil) } }

    validate :validate_phase_poll, on: :response_submission
    validate :validate_option_count, on: :response_submission

    accepts_nested_attributes_for :response_options

    def validate_phase_poll
      return unless phase && !phase.poll?

      errors.add(
        :phase,
        :not_poll,
        message: 'the phase does not have the "poll" participation_method'
      )
    end

    def validate_option_count
      return unless phase

      phase.poll_questions&.each do |question|
        range = case question.question_type
        when 'single_option'
          1..1
        when 'multiple_options'
          1..(question.max_options || question.options.size)
        end
        selected_options = response_options.count { |ro| ro.option.question_id == question.id }

        if selected_options < range.min
          errors.add(
            :base,
            :too_few_options,
            message: 'some questions have been answered with too few corresponding options'
          )
        elsif selected_options > range.max
          errors.add(
            :base,
            :too_many_options,
            message: 'some questions have been answered with too many corresponding options'
          )
        end
      end
    end

    def project_id
      phase.try(:project_id)
    end
  end
end
