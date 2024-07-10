# frozen_string_literal: true

class WebApi::V1::ActionDescriptorsController < ApplicationController
  skip_before_action :authenticate_user
  skip_after_action :verify_authorized, only: [:initiatives]

  def initiatives
    descriptors = Permissions::InitiativePermissionsService.new(current_user).action_descriptors
    render(json: raw_json(descriptors))
  end
end
