# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::OfficialFeedbackOnInitiativeYouFollowMailer do
  describe 'campaign_mail' do
    let(:recipient) { create(:user, locale: 'en') }
    let(:initiative) { create(:initiative, title_multiloc: { 'en' => 'Initiative title' }) }
    let(:feedback) { create(:official_feedback, body_multiloc: { 'en' => 'We appreciate your participation' }, post: initiative) }
    let(:campaign) { EmailCampaigns::Campaigns::OfficialFeedbackOnInitiativeYouFollow.create! }
    let(:notification) { create(:official_feedback_on_initiative_you_follow, recipient: recipient, post: initiative, official_feedback: feedback) }
    let(:command) do
      activity = create(:activity, item: notification, action: 'created')
      create(:official_feedback_on_initiative_you_follow_campaign).generate_commands(
        activity: activity,
        recipient: recipient
      ).first.merge({ recipient: recipient })
    end

    let(:mail) { described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now }

    before { EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id) }

    it 'renders the subject' do
      expect(mail.subject).to start_with('A proposal you follow has received an official update')
    end

    it 'renders the sender email' do
      expect(mail.from).to all(end_with('@citizenlab.co'))
    end

    it 'assigns organisation name' do
      expect(mail.body.encoded).to match(AppConfiguration.instance.settings('core', 'organization_name', 'en'))
    end

    it 'assigns cta url' do
      expect(mail.body.encoded).to match(command.dig(:event_payload, :official_feedback_url))
    end

    it 'includes the initiative title' do
      expect(mail.body.encoded).to match('Initiative title')
    end

    it 'includes the unfollow url' do
      expect(mail.body.encoded).to match(Frontend::UrlService.new.unfollow_url(Follower.new(followable: notification.post, user: recipient)))
    end
  end
end
