# frozen_string_literal: true

module Polls::WebApi::V1::PollPhaseSerializer
  extend ActiveSupport::Concern

  included do
    attribute :poll_anonymous
  end
end
