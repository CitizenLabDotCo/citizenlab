# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::NewCommentForAdminMailer do
  describe 'NewCommentForAdmin' do
    let_it_be(:recipient) { create(:user, locale: 'en') }
    let_it_be(:campaign) { EmailCampaigns::Campaigns::NewCommentForAdmin.create! }
    let_it_be(:command) do
      {
        recipient: recipient,
        event_payload: {
          initiating_user_first_name: 'Chewbacca',
          initiating_user_last_name: nil,
          comment_author_name: 'Chewbacca',
          comment_body_multiloc: {
            en: 'Ruh roooarrgh yrroonn wyaaaaaa ahuma hnn-rowr ma'
          },
          comment_url: 'http://localhost:3000/en/ideas/wiki-roulette',
          post_published_at: 2.weeks.ago.iso8601,
          post_title_multiloc: {
            en: 'Wiki Roulette'
          },
          post_author_name: "K\u00c3\u00bcn Gremmelpret"
        }
      }
    end

    let_it_be(:mail) { described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now }

    before_all { EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id) }

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
      expect(mail.body.encoded).to include('Chewbacca')
    end

    it 'includes the comment body' do
      expect(mail.body.encoded).to include('roooarrgh')
    end

    it 'includes the time when it was posted' do
      expect(mail.body.encoded).to include('14')
    end
  end
end
