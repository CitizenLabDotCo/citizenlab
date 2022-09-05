# frozen_string_literal: true

class RemoveUserFromIntercomJob < ApplicationJob
  queue_as :default

  def run(user_id)
    TrackIntercomService.new(INTERCOM_CLIENT).forget_user(user_id) if INTERCOM_CLIENT
  end
end
