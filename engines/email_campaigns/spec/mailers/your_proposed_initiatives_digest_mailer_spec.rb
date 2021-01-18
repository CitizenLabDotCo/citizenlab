require 'rails_helper'

RSpec.describe EmailCampaigns::YourProposedInitiativesDigestMailer, type: :mailer do
  describe 'YourProposedInitiativesDigest' do
    let!(:recipient) { create(:admin, locale: 'en') }
    let!(:campaign) { EmailCampaigns::Campaigns::YourProposedInitiativesDigest.create! }

    let(:initiatives) { create_list(:assigned_initiative, 3) }
    let(:command) do {
        recipient: recipient,
        event_payload: {
          initiatives: initiatives.map{ |initiative|
            {
              title_multiloc: initiative.title_multiloc,
              body_multiloc: initiative.body_multiloc,
              url: Frontend::UrlService.new.model_to_url(initiative),
              published_at: initiative.published_at&.iso8601,
              upvotes_count: initiative.upvotes_count,
              votes_needed: initiative.votes_needed,
              votes_this_week: initiative.upvotes.where('created_at > ?', Time.now - 1.week).count,
              comments_count: initiative.comments_count,
              expires_at: initiative.expires_at.iso8601,
              status_code: initiative.initiative_status.code,
              images: initiative.initiative_images.map{ |image|
                {
                  ordering: image.ordering,
                  versions: image.image.versions.map{|k, v| [k.to_s, v.url]}.to_h
                }
              },
              header_bg: {
                versions: initiative.header_bg.versions.map{|k, v| [k.to_s, v.url]}.to_h
              }
            }
          }
        }
      }
    end
    let(:mail) { described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now }

    before do
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
