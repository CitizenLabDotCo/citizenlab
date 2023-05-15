# frozen_string_literal: true

module Polls
  class WebApi::V1::QuestionSerializer < ::WebApi::V1::BaseSerializer
    attributes :question_type, :title_multiloc, :max_options, :ordering

    # We specify the namespace for the serializer(s), because if we just use polymorphic: true
    # jsonapi-serializer will look for the serializer(s) in the same namespace as this serializer, which will fail.
    belongs_to :participation_context, serializer: proc { |object|
      "::WebApi::V1::#{object.class.name}Serializer".constantize
    }

    has_many :options
  end
end
