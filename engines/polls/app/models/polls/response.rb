module Polls
	class Response < ApplicationRecord

    belongs_to :user
    belongs_to :participation_context, polymorphic: true
    has_many :response_options, class_name: 'Polls::ResponseOption', dependent: :destroy

		validates :user, :participation_context, presence: true
		validates :user, uniqueness: {scope: [:participation_context]}

		validate :validate_participation_context_poll
		validate :validate_all_questions_one_option, on: :response_submission

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

		def validate_all_questions_one_option
			if participation_context
				questions = participation_context.poll_questions
				answered_questions = response_options.map{|ro| ro.option.question}
				if questions.sort != answered_questions.sort
					self.errors.add(
						:base,
						:not_all_questions_one_option,
						message: 'not all questions have been answered with exactly one corresponding option'
					)
				end
			end
		end
	end
end