# frozen_string_literal: true

class UsersBlockedCountChannel < ApplicationCable::Channel
  def subscribed
    stream_from 'users_blocked_count_channel'
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end
end
