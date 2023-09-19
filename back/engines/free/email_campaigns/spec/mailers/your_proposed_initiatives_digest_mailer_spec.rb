# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::YourProposedInitiativesDigestMailer do
  describe 'YourProposedInitiativesDigest' do
    let_it_be(:recipient) { create(:admin, locale: 'en') }
    let_it_be(:initiatives) { create_list(:initiative, 3) }
    let_it_be(:campaign) { EmailCampaigns::Campaigns::YourProposedInitiativesDigest.create! }
    let_it_be(:command) do
      {
        recipient: recipient,
        event_payload: {
          initiatives: initiatives.map do |initiative|
            {
              title_multiloc: initiative.title_multiloc,
              body_multiloc: initiative.body_multiloc,
              url: Frontend::UrlService.new.model_to_url(initiative),
              published_at: initiative.published_at&.iso8601,
              likes_count: initiative.likes_count,
              reactions_needed: initiative.reactions_needed,
              reactions_this_week: initiative.likes.where('created_at > ?', 1.week.ago).count,
              comments_count: initiative.comments_count,
              expires_at: initiative.expires_at.iso8601,
              status_code: initiative.initiative_status.code,
              images: initiative.initiative_images.map do |image|
                {
                  ordering: image.ordering,
                  versions: image.image.versions.to_h { |k, v| [k.to_s, v.url] }
                }
              end,
              header_bg: {
                versions: initiative.header_bg.versions.to_h { |k, v| [k.to_s, v.url] }
              }
            }
          end
        }
      }
    end

    let_it_be(:mail) { described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now }

    before_all do
      EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id)
    end

    # Copy should change from "proposal" to "proposals".
    it 'renders the subject' do
      expect(mail.subject).to start_with('Weekly update of your proposals')
    end

    it 'renders the receiver email' do
      expect(mail.to).to eq([recipient.email])
    end

    it 'renders the sender email' do
      expect(mail.from).to all(end_with('@citizenlab.co'))
    end

    it 'assigns idea title' do
      expect(mail.body.encoded).to match(initiatives.first.title_multiloc['en'])
    end

    it 'assigns initiatives url' do
      expect(mail.body.encoded).to match(Frontend::UrlService.new.initiatives_url)
    end
  end
end
