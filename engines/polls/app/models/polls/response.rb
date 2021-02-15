module Polls
  class Response < ApplicationRecord

    belongs_to :user
    belongs_to :participation_context, polymorphic: true
    has_many :response_options, class_name: 'Polls::ResponseOption', dependent: :destroy

    validates :user, :participation_context, presence: true
    validates :user, uniqueness: {scope: [:participation_context]}

    validate :validate_participation_context_poll, on: :response_submission
    validate :validate_option_count, on: :response_submission

    accepts_nested_attributes_for :response_options

    def validate_participation_context_poll
      if participation_context && !participation_context.poll?
        self.errors.add(
          :participation_context,
          :not_poll,
          message: 'the participation_context does not have the "poll" participation_method'
        )
      end
    end

    def validate_option_count
      if participation_context
        participation_context.poll_questions.each do |question|
          range = case question.question_type
            when 'single_option'
              1..1
            when 'multiple_options'
              1..(question.max_options || question.options.size)
            end
          selected_options = response_options.select{|ro| ro.option.question_id == question.id}.size

          if selected_options < range.min
            self.errors.add(
              :base,
              :too_few_options,
              message: 'some questions have been answered with too few corresponding options'
            )
          elsif selected_options > range.max
            self.errors.add(
              :base,
              :too_many_options,
              message: 'some questions have been answered with too many corresponding options'
            )
          end
        end
      end
    end
  end
end