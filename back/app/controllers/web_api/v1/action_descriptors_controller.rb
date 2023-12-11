# frozen_string_literal: true

class WebApi::V1::ActionDescriptorsController < ApplicationController
  skip_before_action :authenticate_user
  skip_after_action :verify_authorized, only: [:initiatives]

  def initiatives
    ps = PermissionsService.new
    posting_disabled_reason = ps.denied_reason_for_resource(current_user, 'posting_initiative')
    commenting_disabled_reason = ps.denied_reason_for_resource(current_user, 'commenting_initiative')
    reacting_disabled_reason = ps.denied_reason_for_resource(current_user, 'reacting_initiative')

    descriptors = {
      posting_initiative: { disabled_reason: posting_disabled_reason },
      commenting_initiative: { disabled_reason: commenting_disabled_reason },
      reacting_initiative: { disabled_reason: reacting_disabled_reason }
    }

    descriptors.each { |_, desc| desc[:enabled] = !desc[:disabled_reason] }
    descriptors[:comment_reacting_initiative] = descriptors[:commenting_initiative]
    descriptors[:cancelling_initiative_reactions] = descriptors[:reacting_initiative]

    render(json: raw_json(descriptors))
  end
end
