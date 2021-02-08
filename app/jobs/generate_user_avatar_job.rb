class GenerateUserAvatarJob < ApplicationJob
  queue_as :default

  def run(user)
    if user && !user.avatar? && user.email
      hash = Digest::MD5.hexdigest(user.email)
      user.remote_avatar_url = "https://www.gravatar.com/avatar/#{hash}?d=404&size=640"
      user.save if user.avatar.present?
    end
  end

end
