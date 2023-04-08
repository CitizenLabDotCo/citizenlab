# frozen_string_literal: true

class UsersBlockedCountChannel < ApplicationCable::Channel
  def subscribed
    stream_from 'users_blocked_count_channel'
    ActionCable.server.broadcast('users_blocked_count_channel', 'Subscribed!!')
    puts 'Subscribed method called'
  end

  def unsubscribed
    puts 'Unsubscribed from UsersBlockedCountChannel'
  end

  def update(data)
    puts "Received message from UsersBlockedCountChannel: #{data}"
    ActionCable.server.broadcast('users_blocked_count_channel', data)
  end

  def broadcast(data)
    puts "Broadcasting data: #{data}"
    ActionCable.server.broadcast('users_blocked_count_channel', data)
  end
end
