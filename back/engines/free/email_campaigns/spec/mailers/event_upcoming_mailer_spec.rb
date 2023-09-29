# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::EventUpcomingMailer do
  describe 'campaign_mail' do
    let_it_be(:recipient) { create(:user, locale: 'en') }
    let_it_be(:campaign) { EmailCampaigns::Campaigns::EventUpcoming.create! }
    let_it_be(:project) { create(:project) }
    let_it_be(:event) { create(:event, project: project, start_at: Time.parse('24-12-2023 18:00'), end_at: Time.parse('24-12-2023 20:00')) }
    let_it_be(:notification) { create(:event_upcoming, recipient: recipient, project: project, event: event) }
    let_it_be(:command) do
      activity = create(:activity, item: notification, action: 'created')
      create(:event_upcoming_campaign).generate_commands(
        activity: activity,
        recipient: recipient
      ).first.merge({ recipient: recipient })
    end

    let_it_be(:mail) { described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now }

    before_all { EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id) }

    it 'renders the subject' do
      expect(mail.subject).to start_with('Your event is coming up!')
    end

    it 'renders the sender email' do
      expect(mail.from).to all(end_with('@citizenlab.co'))
    end

    it 'assigns the date' do
      expect(mail.body.encoded).to match('Date')
      expect(mail.body.encoded).to match('24 Dec 18:00 =E2=80=93 24 Dec 20:00') # =E2=80=93 is a hyphen
    end

    it 'assigns the project' do
      expect(mail.body.encoded).to match('Project')
      expect(mail.body.encoded).to match(project.title_multiloc['en'])
    end

    it 'assigns view the event CTA' do
      expect(mail.body.encoded).to match('View the event')
      expect(mail.body.encoded).to match(Frontend::UrlService.new.model_to_url(event, locale: 'en'))
    end

    it 'assigns view the add to your calendar CTA' do
      expect(mail.body.encoded).to match('Add to your calendar')
      expect(mail.body.encoded).to match(%r{.*/events/.+\.ics}) # match(events/.*\.ics) # match(%r{http://example\.org/web_api/v1/events/.*\.ics})
    end
  end
end
