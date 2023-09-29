# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::EventRegistrationConfirmation do
  describe 'EventRegistrationConfirmation Campaign default factory' do
    it 'is valid' do
      expect(build(:event_registration_confirmation_campaign)).to be_valid
    end
  end

  describe '#generate_commands' do
    let(:campaign) { create(:event_registration_confirmation_campaign) }
    let(:event_attendance) { create(:event_attendance) }
    let(:recipient) { event_attendance.attendee }
    let(:event) { event_attendance.event }
    let(:activity) do
      create(:activity, item: event_attendance, action: 'created', user: recipient)
    end

    let(:frontend_service) { instance_double(Frontend::UrlService, :fe_service) }

    before do
      allow(Frontend::UrlService).to receive(:new).and_return(frontend_service)

      locale = recipient.locale
      project = event.project

      allow(frontend_service).to receive(:model_to_url).with(event, locale: locale).and_return('event_url')
      allow(frontend_service).to receive(:model_to_url).with(project, locale: locale).and_return('project_url')
    end

    it 'generates the correct commands' do
      commands = campaign.generate_commands(recipient: recipient, activity: activity)

      expect(commands).to be_an(Array)
      expect(commands.size).to eq(1)
      expect(commands[0][:event_payload]).to eq({
        event_attributes: event.attributes,
        event_url: 'event_url',
        project_url: 'project_url',
        project_title_multiloc: event.project.title_multiloc,
        image_url: event.project.header_bg.url
      })
    end
  end
end
