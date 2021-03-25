module Polls::WebApi::V1::PollParticipationContextSerializer
  extend ActiveSupport::Concern

  included do
    with_options if: Proc.new { |object|
      object.participation_context?
    } do
      attribute :poll_anonymous
    end
  end
end
