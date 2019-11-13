module Polls
	class WebApi::V1::QuestionSerializer < ::WebApi::V1::BaseSerializer
		attributes :title_multiloc, :ordering

		belongs_to :participation_context, polymorphic: true
		has_many :options
	end
end