# frozen_string_literal: true

require 'email_campaigns/engine'

module EmailCampaigns
  module MailerPreview
    private

    def preview_campaign_mail(campaign_class)
      campaign = campaign_class.new
      command = campaign.mailer_class.preview_command(recipient: recipient_user)
      campaign.mailer_class.with(campaign: campaign, command: command).campaign_mail
    end

    def recipient_user
      @user ||= User.first
      @user.locale = params[:locale] || :en
      @user
    end

    def recipient_admin
      @user ||= User.admin.first
      @user.locale = params[:locale] || :en
      @user
    end
  end
end
