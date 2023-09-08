# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::EventUpcomingMailer do
  describe 'campaign_mail' do
    let_it_be(:recipient) { create(:user, locale: 'en') }
    let_it_be(:campaign) { EmailCampaigns::Campaigns::EventUpcoming.create! }
    let_it_be(:project) { create(:project) }
    let_it_be(:event) { create(:event, project: project) }
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

    # TODO: Verify more email content
  end
end
