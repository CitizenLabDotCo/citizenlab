# frozen_string_literal: true

module Polls
  class WebApi::V1::QuestionSerializer < ::WebApi::V1::BaseSerializer
    attributes :question_type, :title_multiloc, :max_options, :ordering

    # We specify the serializer(s) for the object(s), because if we just use polymorphic: true
    # jsonapi-serializer will look for the serializer(s) in the same namespace as this serializer, which will fail.
    belongs_to :participation_context, serializer: proc { |object|
      case object
      when Phase
        ::WebApi::V1::PhaseSerializer
      when Project
        ::WebApi::V1::ProjectSerializer
      else
        raise ArgumentError, "Unknown participation_context type: #{object.class.name}"
      end
    }
    has_many :options
  end
end
