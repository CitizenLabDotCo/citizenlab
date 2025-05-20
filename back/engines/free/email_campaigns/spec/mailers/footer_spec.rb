# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Footer' do
  before do
    SettingsService.new.deactivate_feature! 'remove_vendor_branding'
    EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id)
  end

  let(:locale) { 'en' }
  let(:recipient) { create(:user, locale: locale) }
  let(:campaign) { EmailCampaigns::Campaigns::CommentOnIdeaYouFollow.create! }
  let(:command) do
    create(:comment_on_idea_you_follow_campaign).generate_commands(
      activity: create(:activity, item: create(:comment_on_idea_you_follow), action: 'created'),
      recipient: recipient
    ).first.merge({ recipient: recipient })
  end

  let(:mail) { EmailCampaigns::CommentOnIdeaYouFollowMailer.with(command: command, campaign: campaign).campaign_mail.deliver_now }
  let(:body) { mail_body(mail) }

  it 'includes Go Vocal logo' do
    expect(body).to have_tag('a', with: { href: 'https://govocal.com/' }) do
      with_tag 'img', with: { alt: 'Go Vocal logo', src: 'https://cl2-seed-and-template-assets.s3.eu-central-1.amazonaws.com/images/formerly-logo/formerly_gray_en.png' }
    end
  end

  describe 'when the locale is not English' do
    let(:locale) { 'nl-NL' }

    it 'includes the corresponding Go Vocal logo' do
      expect(body).to have_tag('a', with: { href: 'https://govocal.com/' }) do
        with_tag 'img', with: { alt: 'Go Vocal logo', src: 'https://cl2-seed-and-template-assets.s3.eu-central-1.amazonaws.com/images/formerly-logo/formerly_gray_nl.png' }
      end
    end
  end

  describe 'when the recipient can give/revoke consent' do
    it 'includes the unsubscribe link' do
      unsubscribe_url = Frontend::UrlService.new.unsubscribe_url(
        AppConfiguration.instance,
        campaign.id,
        recipient.id
      ).gsub('&', '&amp;')

      allow(campaign.class).to receive(:consentable_for?).with(recipient).and_return(true)
      expect(body.scan(unsubscribe_url).count).to eq(2)
    end
  end

  describe 'when the recipient cannot give/revoke consent' do
    it 'does not include the unsubscribe link' do
      unsubscribe_url = Frontend::UrlService.new.unsubscribe_url(
        AppConfiguration.instance,
        campaign.id,
        recipient.id
      ).gsub('&', '&amp;')

      allow(campaign.class).to receive(:consentable_for?).with(recipient).and_return(false)
      expect(body.scan(unsubscribe_url).count).to eq(0)
    end
  end
end
