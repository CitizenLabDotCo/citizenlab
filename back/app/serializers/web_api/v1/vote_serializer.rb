# frozen_string_literal: true

class WebApi::V1::VoteSerializer < WebApi::V1::BaseSerializer
  attributes :mode

  belongs_to :reactable, polymorphic: true
end
