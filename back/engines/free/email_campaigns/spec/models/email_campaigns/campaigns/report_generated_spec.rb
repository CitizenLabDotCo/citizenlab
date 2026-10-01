# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::ReportGenerated do
  let(:campaign) { create(:report_generated_campaign) }
  let(:notification) { create(:report_generated) }
  let(:activity) { create(:activity, item: notification, action: 'created') }

  it 'has a valid default factory' do
    expect(build(:report_generated_campaign)).to be_valid
  end

  describe '#generate_commands' do
    it 'links to the report and names the project it is about' do
      command = campaign.generate_commands(recipient: notification.recipient, activity: activity).first

      expect(command[:event_payload][:project_title_multiloc]).to eq notification.project.title_multiloc
      expect(command[:event_payload][:report_url]).to end_with(
        "/admin/reporting/report-builder/#{notification.report_id}/editor"
      )
    end
  end

  describe 'recipients' do
    it 'is only the admin who asked for the report' do
      other_admin = create(:admin)

      recipients = campaign.apply_recipient_filters(activity: activity)

      expect(recipients.pluck(:id)).to eq [notification.recipient_id]
      expect(recipients.pluck(:id)).not_to include other_admin.id
    end
  end
end
