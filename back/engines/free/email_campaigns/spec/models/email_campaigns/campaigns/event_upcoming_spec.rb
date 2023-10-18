# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::EventUpcoming do
  describe 'EventUpcoming Campaign default factory' do
    it 'is valid' do
      expect(build(:event_upcoming_campaign)).to be_valid
    end
  end

  describe '#generate_commands' do
    let(:campaign) { create(:event_upcoming_campaign) }
    let(:project) { create(:project) }
    let(:event) { create(:event, project: project) }
    let(:notification) { create(:event_upcoming, event: event, project: project) }
    let(:notification_activity) { create(:activity, item: notification, action: 'created') }
    let(:command) do
      campaign.generate_commands(recipient: notification_activity.item.recipient, activity: notification_activity).first
    end

    it 'generates a command with the desired payload and tracked content' do
      expect(command).to match({
        event_payload: hash_including(
          event_id: event.id,
          event_title_multiloc: event.title_multiloc,
          event_description_multiloc: event.description_multiloc,
          event_start_at: an_instance_of(String),
          event_end_at: an_instance_of(String),
          event_location_multiloc: event.location_multiloc,
          event_online_link: event.online_link,
          event_url: an_instance_of(String),
          project_title_multiloc: project.title_multiloc
        )
      })
    end
  end
end
