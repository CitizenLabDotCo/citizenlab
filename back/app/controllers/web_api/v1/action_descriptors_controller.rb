# frozen_string_literal: true

class WebApi::V1::ActionDescriptorsController < ApplicationController
  skip_before_action :authenticate_user
  skip_after_action :verify_authorized, only: [:initiatives]

  def initiatives
    descriptors = Permissions::InitiativePermissionsService.new.action_descriptors(current_user)
    render(json: raw_json(descriptors))
  end
end
