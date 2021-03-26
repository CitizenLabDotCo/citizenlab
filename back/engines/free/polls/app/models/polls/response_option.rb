module Polls
	class ResponseOption < ApplicationRecord

    belongs_to :response, class_name: 'Polls::Response'
    belongs_to :option, class_name: 'Polls::Option'

		validates :response, :option, presence: true
		validates :option, uniqueness: {scope: [:response]}

		validate :validate_same_participation_context

		private

		def validate_same_participation_context
			if response && option
				if response.participation_context != option.question.participation_context
		      self.errors.add(
		        :option_id,
		        :option_and_response_not_in_same_poll,
		        message: 'The selected option is not associated with the same participation context than the response'
		      )
				end
			end
		end

	end
end