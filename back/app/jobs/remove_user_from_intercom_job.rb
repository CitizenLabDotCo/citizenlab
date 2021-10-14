# frozen_string_literal: true

class RemoveUserFromIntercomJob < ApplicationJob
  queue_as :default

  def run(user)
    TrackIntercomService.new(INTERCOM_CLIENT).forget_user(user) if INTERCOM_CLIENT
  end
end
