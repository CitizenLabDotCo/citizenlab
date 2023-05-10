# frozen_string_literal: true

module Polls
  class WebApi::V1::QuestionSerializer < ::WebApi::V1::BaseSerializer
    attributes :question_type, :title_multiloc, :max_options, :ordering

    belongs_to :participation_context, serializer: proc { |object|
      if object.instance_of? Phase
        ::WebApi::V1::PhaseSerializer
      else
        ::WebApi::V1::ProjectSerializer
      end
    }
    has_many :options
  end
end
