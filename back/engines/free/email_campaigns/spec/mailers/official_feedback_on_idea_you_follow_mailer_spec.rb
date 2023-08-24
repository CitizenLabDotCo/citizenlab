# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::OfficialFeedbackOnIdeaYouFollowMailer do
  describe 'campaign_mail' do
    let(:recipient) { create(:user, locale: 'en') }
    let(:idea) { create(:idea, title_multiloc: { 'en' => 'Idea title' }) }
    let(:feedback) { create(:official_feedback, body_multiloc: { 'en' => 'We appreciate your participation' }, post: idea) }
    let(:campaign) { EmailCampaigns::Campaigns::OfficialFeedbackOnIdeaYouFollow.create! }
    let(:notification) { create(:official_feedback_on_idea_you_follow, recipient: recipient, post: idea, official_feedback: feedback) }
    let(:command) do
      activity = create(:activity, item: notification, action: 'created')
      create(:official_feedback_on_idea_you_follow_campaign).generate_commands(
        activity: activity,
        recipient: recipient
      ).first.merge({ recipient: recipient })
    end

    let(:mail) { described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now }

    before { EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id) }

    it 'renders the subject' do
      expect(mail.subject).to start_with('An idea you follow has received an official update')
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

    it 'includes the idea title' do
      expect(mail.body.encoded).to match('Idea title')
    end

    it 'includes the unfollow url' do
      expect(mail.body.encoded).to match(Frontend::UrlService.new.unfollow_url(Follower.new(followable: idea, user: recipient)))
    end
  end
end
