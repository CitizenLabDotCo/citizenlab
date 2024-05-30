# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Footer' do
  before do
    SettingsService.new.deactivate_feature! 'remove_vendor_branding'
    EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id)
  end

  let(:locale) { 'en' }
  let(:recipient) { create(:user, locale: locale) }
  let(:command) do
    create(:comment_on_initiative_you_follow_campaign).generate_commands(
      activity: create(:activity, item: create(:comment_on_initiative_you_follow), action: 'created'),
      recipient: recipient
      ).first.merge({ recipient: recipient })
    end
  let(:campaign) { EmailCampaigns::Campaigns::CommentOnInitiativeYouFollow.create! }
    
  let(:mail) { EmailCampaigns::CommentOnInitiativeYouFollowMailer.with(command: command, campaign: campaign).campaign_mail.deliver_now }

  it 'includes Go Vocal logo' do
    expect(mail.body.encoded).to have_tag('a', with: { href: 'https://govocal.com/' }) do
      with_tag 'img', with: { alt: 'Go Vocal logo', src: 'https://cl2-seed-and-template-assets.s3.eu-central-1.amazonaws.com/images/formerly-logo/formerly_gray_en.png' }
    end
  end

  describe 'when the locale is not English' do
    let(:locale) { 'nl-NL' }

    it 'includes the corresponding Go Vocal logo' do
      expect(mail.body.encoded).to have_tag('a', with: { href: 'https://govocal.com/' }) do
        with_tag 'img', with: { alt: 'Go Vocal logo', src: 'https://cl2-seed-and-template-assets.s3.eu-central-1.amazonaws.com/images/formerly-logo/formerly_gray_nl.png' }
      end
    end
  end
end
