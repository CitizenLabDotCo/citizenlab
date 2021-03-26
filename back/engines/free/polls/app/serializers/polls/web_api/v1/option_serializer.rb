module Polls
	class WebApi::V1::OptionSerializer < ::WebApi::V1::BaseSerializer
		attributes :title_multiloc, :ordering

		belongs_to :question
	end
end