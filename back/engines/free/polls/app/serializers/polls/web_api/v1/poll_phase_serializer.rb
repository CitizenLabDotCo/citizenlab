# frozen_string_literal: true

module Polls::WebApi::V1::PollPhaseSerializer
  extend ActiveSupport::Concern

  included do
    with_options if: proc { |object|
      object.participation_context?
    } do
      attribute :poll_anonymous
    end
  end
end
