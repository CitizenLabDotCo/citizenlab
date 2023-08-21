# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::StatusChangeOnInitiativeYouFollowMailer do
  describe 'campaign_mail' do
    let(:recipient) { create(:user, locale: 'en') }
    let(:campaign) { EmailCampaigns::Campaigns::StatusChangeOnInitiativeYouFollow.create! }
    let(:initiative) { create(:initiative) }
    let(:command) do
      status = initiative.initiative_status

      {
        recipient: recipient,
        event_payload: {
          post_id: initiative.id,
          post_title_multiloc: initiative.title_multiloc,
          post_body_multiloc: initiative.body_multiloc,
          post_url: Frontend::UrlService.new.model_to_url(initiative, locale: recipient.locale),
          post_images: initiative.initiative_images.map do |image|
            {
              ordering: image.ordering,
              versions: image.image.versions.to_h { |k, v| [k.to_s, v.url] }
            }
          end,
          initiative_status_id: status.id,
          initiative_status_title_multiloc: status.title_multiloc,
          initiative_status_code: status.code,
          initiative_status_color: status.color
        }
      }
    end

    let(:mail) { described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now }

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
      expect(mail.body.encoded).to match(Frontend::UrlService.new.unfollow_url(recipient))
    end
  end
end
