# frozen_string_literal: true

class UsersBlockedCountChannel < ApplicationCable::Channel
  def subscribed
    stream_for 'users_blocked_count_channel'
    ActionCable.server.broadcast 'users_blocked_count_channel', 'Subscribed!!'
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end
end
