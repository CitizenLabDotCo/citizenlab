class WebApi::V1::ActionDescriptorsController < ApplicationController
  skip_before_action :authenticate_user
  skip_after_action :verify_authorized, only: [:initiatives]

  def initiatives
    # rubocop:disable Layout/HashAlignment
    descriptors = {
      posting_initiative:          { enabled: true, disabled_reason: nil },
      commenting_initiative:       { enabled: true, disabled_reason: nil },
      voting_initiative:           { enabled: true, disabled_reason: nil },
      comment_voting_initiative:   { enabled: true, disabled_reason: nil },
      cancelling_initiative_votes: { enabled: true, disabled_reason: nil }
    }
    # rubocop:enable Layout/HashAlignment
    render(json: descriptors)
  end
end

WebApi::V1::ActionDescriptorsController.prepend_if_ee('GranularPermissions::Patches::WebApi::V1::ActionDescriptorsController')
