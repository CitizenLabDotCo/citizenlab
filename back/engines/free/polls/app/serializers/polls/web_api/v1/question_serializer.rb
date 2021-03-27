module Polls
	class WebApi::V1::QuestionSerializer < ::WebApi::V1::BaseSerializer
		attributes :question_type, :title_multiloc, :max_options, :ordering

		belongs_to :participation_context, polymorphic: true
		has_many :options
	end
end