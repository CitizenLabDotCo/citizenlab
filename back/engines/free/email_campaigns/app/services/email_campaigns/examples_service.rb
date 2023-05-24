# frozen_string_literal: true

# ExamplesService is responsible for maintaining an adequate and relevant sample
# of email campaign examples in the database. It's called by the email campaigns
# send pipeline on every email. It decided whether the email's html is worth
# storing, and if so stores it and cleans up less relevant examples.
module EmailCampaigns
  class ExamplesService
    EXAMPLES_PER_CAMPAIGN = 5
    RECENCY_THRESHOLD = 1.week

    def save_examples(campaigns_with_command)
      campaigns = campaigns_with_command.map { |(_command, campaign)| campaign }.uniq

      campaigns.each do |campaign|
        recent_examples_n = Example
          .where(campaign: campaign)
          .where('created_at > ?', RECENCY_THRESHOLD.ago)
          .count
        n_lacking = EXAMPLES_PER_CAMPAIGN - recent_examples_n

        next if n_lacking == 0

        total_examples = Example.where(campaign: campaign).count

        new_campaign_commands =
          filter_n_campaigns_with_command_for_campaign(campaigns_with_command, campaign, n_lacking)

        Example
          .where(campaign: campaign)
          .order(created_at: :asc)
          .limit([new_campaign_commands.size, n_lacking].min + [0, (total_examples - EXAMPLES_PER_CAMPAIGN)].max)
          .destroy_all

        next if n_lacking < 0

        new_campaign_commands.each do |(command, campaign)|
          save_example(command, campaign)
        end
      end
    end

    private

    def save_example(command, campaign)
      ErrorReporter.handle do
        mail = campaign.mailer_class.with(campaign: campaign, command: command).campaign_mail
        EmailCampaigns::Example.create!(
          campaign: campaign,
          mail_body_html: mail.body.to_s,
          locale: command[:recipient].locale,
          subject: mail.subject,
          recipient: command[:recipient]
        )
      end
    end

    def filter_n_campaigns_with_command_for_campaign(campaigns_with_command, campaign, n)
      campaigns_with_command.select do |(_command, camp)|
        camp.id == campaign.id
      end.first(n)
    end
  end
end
