# frozen_string_literal: true

class GenerateUserAvatarJob < ApplicationJob
  queue_as :default

  def run(user)
    return unless AppConfiguration.instance.feature_activated?('user_avatars')
    return unless user && !user.avatar? && user.email

    hash = Digest::MD5.hexdigest(user.email)
    user.remote_avatar_url = "https://www.gravatar.com/avatar/#{hash}?d=404&size=640"
    user.save if user.avatar.present?
  end
end
