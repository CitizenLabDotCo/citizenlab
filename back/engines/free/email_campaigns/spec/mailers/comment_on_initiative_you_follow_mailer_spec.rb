# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::CommentOnInitiativeYouFollowMailer do
  describe 'CommentOnInitiativeYouFollow' do
    let(:recipient) { create(:user, locale: 'en') }
    let(:campaign) { EmailCampaigns::Campaigns::CommentOnInitiativeYouFollow.create! }
    let(:initiative) { create(:initiative) }
    let(:comment) { create(:comment, post: initiative) }
    let(:notification) { create(:comment_on_initiative_you_follow, recipient: recipient, post: initiative, comment: comment) }
    let(:command) do
      activity = create(:activity, item: notification, action: 'created')
      create(:comment_on_initiative_you_follow_campaign).generate_commands(
        activity: activity,
        recipient: recipient
      ).first.merge({ recipient: recipient })
    end

    let(:mail) { described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now }

    before { EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id) }

    it 'renders the subject' do
      expect(mail.subject).to be_present
    end

    it 'renders the receiver email' do
      expect(mail.to).to eq([recipient.email])
    end

    it 'renders the sender email' do
      expect(mail.from).to all(end_with('@citizenlab.co'))
    end

    it 'assigns organisation name' do
      expect(mail.body.encoded).to match(AppConfiguration.instance.settings('core', 'organization_name')['en'])
    end

    it 'includes the comment author name' do
      expect(mail.body.encoded).to include('Fred')
    end

    it 'includes the comment body' do
      expect(mail.body.encoded).to include('Zoiets')
    end
  end
end
