# frozen_string_literal: true

require 'email_campaigns/engine'

module EmailCampaigns
  module MailerPreviewRecipient
    def recipient_user
      @user ||= User.first
      @user.locale = params[:locale]
      @user
    end

    def recipient_admin
      @user ||= User.admin.first
      @user.locale = params[:locale]
      @user
    end
  end
end
