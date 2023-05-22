# frozen_string_literal: true

module EmailCampaigns
  class ExamplesService
    EXAMPLES_PER_CAMPAIGN = 5
    RECENCY_THRESHOLD = 1.week

    def save_examples(campaigns_with_command)
      campaign_types = campaigns_with_command.map { |(_command, campaign)| campaign.type }.uniq

      campaign_types.each do |campaign_type|
        recent_examples_n = Example
          .where(campaign_class: campaign_type)
          .where('created_at > ?', RECENCY_THRESHOLD.ago)
          .count
        n_lacking = EXAMPLES_PER_CAMPAIGN - recent_examples_n

        next if n_lacking <= 0

        campaign_commands =
          filter_n_campaigns_with_command_for_campaign_type(campaigns_with_command, campaign_type, n_lacking)

        Example.order(created_at: :asc).limit(campaign_commands.size).destroy_all
        campaign_commands.each do |(command, campaign)|
          save_example(command, campaign)
        end
      end
    end

    private

    def save_example(command, campaign)
      mail = campaign.mailer_class.with(campaign: campaign, command: command).campaign_mail

      example = EmailCampaigns::Example.create!(
        campaign_class: campaign.type,
        mail_body_html: mail.body.to_s,
        locale: command[:recipient].locale,
        subject: mail.subject,
        recipient: command[:recipient]
      )
    end

    def filter_n_campaigns_with_command_for_campaign_type(campaigns_with_command, campaign_type, n)
      campaigns_with_command.select do |(_command, campaign)|
        campaign.type == campaign_type
      end.first(n)
    end
  end
end
