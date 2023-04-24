# frozen_string_literal: true

require 'email_campaigns/engine'

module EmailCampaigns
  module MailerPreviewUser
    def user
      @user ||= User.first
      @user.locale = params[:locale]
      @user
    end
  end
end
