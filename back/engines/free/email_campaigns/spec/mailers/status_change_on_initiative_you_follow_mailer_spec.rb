# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::StatusChangeOnInitiativeYouFollowMailer do
  describe 'campaign_mail' do
    let_it_be(:recipient) { create(:user, locale: 'en') }
    let_it_be(:campaign) { EmailCampaigns::Campaigns::StatusChangeOnInitiativeYouFollow.create! }
    let_it_be(:initiative) { create(:initiative) }
    let_it_be(:command) do
      campaign.generate_commands(
        recipient: recipient,
        activity: Activity.new(item: Notification.new(post: initiative))
      ).first.merge({ recipient: recipient })
    end

    let_it_be(:mail) { described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now }

    before { EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id) }

    it 'renders the subject' do
      expect(mail.subject).to start_with('The status of a proposal you follow has changed')
    end

    it 'renders the sender email' do
      expect(mail.from).to all(end_with('@citizenlab.co'))
    end

    it 'assigns organisation name' do
      expect(mail.body.encoded).to match(AppConfiguration.instance.settings('core', 'organization_name', 'en'))
    end

    it 'assigns cta url' do
      expect(mail.body.encoded).to match(command.dig(:event_payload, :post_url))
    end

    it 'includes the initiative title' do
      expect(mail.body.encoded).to match(initiative.title_multiloc['en'])
    end

    it 'includes the unfollow url' do
      expect(mail.body.encoded).to match(Frontend::UrlService.new.unfollow_url(Follower.new(followable: initiative, user: recipient)))
    end
  end
end
