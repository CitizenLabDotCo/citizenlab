# frozen_string_literal: true

class WebApi::V1::ActionDescriptorsController < ApplicationController
  skip_before_action :authenticate_user
  skip_after_action :verify_authorized, only: [:initiatives]

  def initiatives
    descriptors = {
      posting_initiative: { enabled: true, disabled_reason: nil },
      commenting_initiative: { enabled: true, disabled_reason: nil },
      voting_initiative: { enabled: true, disabled_reason: nil },
      comment_voting_initiative: { enabled: true, disabled_reason: nil },
      cancelling_initiative_votes: { enabled: true, disabled_reason: nil }
    }
    render(json: descriptors)
  end
end
