# frozen_string_literal: true

require 'email_campaigns/engine'

module EmailCampaigns
  module MailerPreview
    private

    def preview_campaign_mail(campaign_class)
      campaign = campaign_class.new
      command = campaign.preview_command(recipient_user)
      campaign.mailer_class.with(campaign: campaign, command: command).campaign_mail
    end

    def recipient_user
      @user ||= User.not_admin.order(:created_at).first
      @user.locale = params[:locale] || :en
      @user
    end

    def recipient_admin
      @user ||= User.admin.order(:created_at).first
      @user.locale = params[:locale] || :en
      @user
    end
  end
end
