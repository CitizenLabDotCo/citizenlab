# frozen_string_literal: true

module Polls
  class WebApi::V1::QuestionSerializer < ::WebApi::V1::BaseSerializer
    attributes :question_type, :title_multiloc, :max_options, :ordering

    belongs_to :phase, serializer: ::WebApi::V1::PhaseSerializer

    has_many :options
  end
end
