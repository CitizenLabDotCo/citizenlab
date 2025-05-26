# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::StatusChangeOnIdeaYouFollowMailer do
  describe 'campaign_mail' do
    before_all do
      config = AppConfiguration.instance
      config.settings['core']['organization_name'] = { 'en' => 'Vaudeville' }
      config.save!
    end

    let_it_be(:recipient) { create(:user, locale: 'en') }
    let_it_be(:campaign) { EmailCampaigns::Campaigns::StatusChangeOnIdeaYouFollow.create! }
    let_it_be(:status) { create(:idea_status, title_multiloc: { 'en' => "On the president's desk" }) }
    let_it_be(:input) { create(:idea, title_multiloc: { 'en' => 'Input title' }, idea_status: status) }
    let_it_be(:command) do
      campaign.generate_commands(
        recipient: recipient,
        activity: build(:activity, item: build(:notification, idea: input))
      ).first.merge({ recipient: recipient })
    end

    let_it_be(:mail) { described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now }
    let_it_be(:body) { mail_body(mail) }

    before { EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id) }

    it 'renders the subject' do
      expect(mail.subject).to eq('The status of "Input title" has changed')
    end

    it 'renders the sender email' do
      expect(mail.from).to all(end_with('@citizenlab.co'))
    end

    it 'includes the header' do
      expect(body).to have_tag('div') do
        with_tag 'h1' do
          with_text(/An input you follow has a new status/)
        end
        with_tag 'p' do
          with_text(/Vaudeville updated the status of the input 'Input title' on their digital participation platform./)
        end
      end
    end

    it 'includes the new status box' do
      expect(body).to have_tag('table') do
        with_tag 'div' do
          with_text(/The new status of this input is 'On the president's desk'/)
        end
      end
    end

    it 'includes the CTA' do
      expect(body).to have_tag('a', with: { href: "http://example.org/en/ideas/#{input.slug}" }) do
        with_text(/Go to this input/)
      end
    end

    it 'includes the unfollow url' do
      expect(body).to match(Frontend::UrlService.new.unfollow_url(Follower.new(followable: input, user: recipient)))
    end
  end
end
