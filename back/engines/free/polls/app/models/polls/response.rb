# frozen_string_literal: true

# == Schema Information
#
# Table name: polls_responses
#
#  id                         :uuid             not null, primary key
#  participation_context_id   :uuid             not null
#  participation_context_type :string           not null
#  user_id                    :uuid
#  created_at                 :datetime         not null
#  updated_at                 :datetime         not null
#
# Indexes
#
#  index_poll_responses_on_participation_context               (participation_context_type,participation_context_id)
#  index_polls_responses_on_participation_context_and_user_id  (participation_context_id,participation_context_type,user_id) UNIQUE
#  index_polls_responses_on_user_id                            (user_id)
#
module Polls
  class Response < ApplicationRecord
    belongs_to :user
    belongs_to :participation_context, polymorphic: true
    has_many :response_options, class_name: 'Polls::ResponseOption', dependent: :destroy

    validates :user, :participation_context, presence: true
    validates :user, uniqueness: { scope: [:participation_context] }

    validate :validate_participation_context_poll, on: :response_submission
    validate :validate_option_count, on: :response_submission

    accepts_nested_attributes_for :response_options

    def validate_participation_context_poll
      return unless participation_context && !participation_context.poll?

      errors.add(
        :participation_context,
        :not_poll,
        message: 'the participation_context does not have the "poll" participation_method'
      )
    end

    def validate_option_count
      return unless participation_context

      participation_context.poll_questions&.each do |question|
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
  end
end
