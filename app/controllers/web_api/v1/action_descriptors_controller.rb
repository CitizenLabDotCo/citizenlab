class WebApi::V1::ActionDescriptorsController < ApplicationController

  skip_after_action :verify_authorized, only: [:initiatives]

  def initiatives
    ps = PermissionsService.new
    posting_disabled_reason = ps.posting_initiative_disabled_reason current_user
    commenting_disabled_reason = ps.commenting_initiative_disabled_reason current_user
    voting_disabled_reason = ps.voting_initiative_disabled_reason current_user
    cancelling_votes_disabled_reason = ps.cancelling_votes_disabled_reason_for_initiative current_user
    comment_voting_disabled_reason = ps.voting_disabled_reason_for_initiative_comment current_user

    render(json: {
      posting_initiative: {
        enabled: !posting_disabled_reason,
        disabled_reason: posting_disabled_reason
      },
      commenting_initiative: {
        enabled: !commenting_disabled_reason,
        disabled_reason: commenting_disabled_reason
      },
      voting_initiative: {
        enabled: !voting_disabled_reason,
        disabled_reason: voting_disabled_reason
      },
      cancelling_initiative_votes: {
        enabled: !cancelling_votes_disabled_reason,
        disabled_reason: cancelling_votes_disabled_reason
      },
      comment_voting_initiative: {
        enabled: !comment_voting_disabled_reason,
        disabled_reason: comment_voting_disabled_reason
      },
    })
  end

  def secure_controller?
    false
  end
end
