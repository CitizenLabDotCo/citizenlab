# frozen_string_literal: true

module EmailCampaigns
  class ExamplesService
    EXAMPLES_PER_CAMPAIGN = 10

    def save_examples(campaigns_with_command)
      campaign_types = campaigns_with_command.map { |(_command, campaign)| campaign.type }.uniq

      campaign_types.each do |campaign_type|
        n_lacking = EXAMPLES_PER_CAMPAIGN - EmailCampaigns::RecentExample.where(campaign_class: campaign_type).count

        if n_lacking.positive?
          campaign_commands =
            filter_n_campaigns_with_command_for_campaign_type(campaigns_with_command, campaign_type, n_lacking)
          campaign_commands.each { |(command, campaign)| save_example(command, campaign) }
        else
          EmailCampaigns::RecentExample.where(campaign_class: campaign_type).order(:created_at).first.destroy
          campaign_command =
            filter_n_campaigns_with_command_for_campaign_type(campaigns_with_command, campaign_type, 1).first
          save_example(campaign_command[0], campaign_command[1])
        end
      end
    end

    def save_example(command, campaign)
      mail = campaign.mailer_class.with(campaign: campaign, command: command).campaign_mail

      example = EmailCampaigns::RecentExample.new(
        campaign_class: campaign.type,
        mail_body_html: mail.body.to_s,
        locale: command[:recipient].locale,
        subject: mail.subject,
        recipient: command[:recipient].id # We can serialize email for response, if user exists, else a 'user_deleted' string
      )

      return if example.save

      # TODO: Develop error handling, if needed.
      puts "Failed to save example for campaign #{campaign.type}"
      # Sentry error?
    end

    def filter_n_campaigns_with_command_for_campaign_type(campaigns_with_command, campaign_type, n)
      campaigns_with_command.select do |(_command, campaign)|
        campaign.type == campaign_type
      end.first(n)
    end
  end
end
