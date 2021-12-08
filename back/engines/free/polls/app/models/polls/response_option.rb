# == Schema Information
#
# Table name: polls_response_options
#
#  id          :uuid             not null, primary key
#  response_id :uuid
#  option_id   :uuid
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#
# Indexes
#
#  index_polls_response_options_on_option_id    (option_id)
#  index_polls_response_options_on_response_id  (response_id)
#
# Foreign Keys
#
#  fk_rails_...  (option_id => polls_options.id)
#  fk_rails_...  (response_id => polls_responses.id)
#
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
