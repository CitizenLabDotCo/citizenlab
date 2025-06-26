# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'AllMailers' do
  describe 'editable regions' do
    EmailCampaigns::DeliveryService::CAMPAIGN_CLASSES.each do |campaign_class|
      campaign = campaign_class.new
      if campaign.mailer_class.respond_to?(:editable_regions)
        it "#{campaign_class} has editable regions that match defined multilocs" do
          campaign = campaign_class.new
          campaign.mailer_class.editable_regions.each do |region|
            expect { campaign.send(region[:key]) }.not_to raise_error
          end
        end

        it "#{campaign_class} has valid variables defined that match the default text" do
          editable_region_variables = campaign.mailer_class.editable_region_variable_keys || []
          campaign.mailer_class.editable_regions.each do |region|
            # Extract variables in format {{variable}} from the default value text
            variables_in_text = region[:default_value_multiloc].values.join(' ').scan(/\{\{(.*?)}}/).flatten
            variables_in_text.each do |variable|
              expect(editable_region_variables).to include(variable.strip)
            end
          end
        end
      end
    end
  end
end
