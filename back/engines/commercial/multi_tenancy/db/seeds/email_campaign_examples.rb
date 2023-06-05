# frozen_string_literal: true

require_relative 'base'

module MultiTenancy
  module Seeds
    class EmailCampaignExamples < Base
      def run
        EmailCampaigns::Campaign.order('RANDOM()').limit(rand(2..9)).each do |campaign|
          rand(3).times do
            recipient = User.find(User.ids.sample)
            EmailCampaigns::Example.create!(
              campaign: campaign,
              recipient: recipient,
              subject: Faker::Lorem.sentence,
              mail_body_html: "<html><body>#{Faker::Lorem.paragraph}</body></html>",
              locale: recipient.locale
            )
          end
        end
      end
    end
  end
end
