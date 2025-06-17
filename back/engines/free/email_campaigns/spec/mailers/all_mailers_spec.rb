# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'AllMailers' do
  describe 'editable regions' do
    EmailCampaigns::DeliveryService::CAMPAIGN_CLASSES.each do |campaign_class|
      it "#{campaign_class} has editable regions that match defined multilocs" do
        campaign = campaign_class.new
        campaign.mailer_class.editable_regions.each do |region|
          expect { campaign.send(region[:key]) }.not_to raise_error
        end
      end

      it "#{campaign_class} has valid variables defined that match the default text" do
        campaign = campaign_class.new
        campaign.mailer_class.editable_regions.each do |region|
          region_variables = region[:variables] || []
          # Extract variables in format {{variable}} from the default value text
          variables_in_text = region[:default_value_multiloc].values.join(' ').scan(/\{\{(.*?)}}/).flatten
          variables_in_text.each do |variable|
            expect(region_variables).to include(variable.strip)
          end
        end
      end
    end
  end
end
