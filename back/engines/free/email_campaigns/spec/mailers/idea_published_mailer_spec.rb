# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::IdeaPublishedMailer do
  describe 'campaign_mail' do
    before_all do
      config = AppConfiguration.instance
      config.settings['core']['organization_name'] = { 'en' => 'Vaudeville' }
      config.save!
    end

    let_it_be(:recipient) { create(:user, locale: 'en') }
    let_it_be(:campaign) { EmailCampaigns::Campaigns::IdeaPublished.create! }
    let_it_be(:input) { create(:idea, author: recipient) }
    let_it_be(:command) do
      activity = create(:activity, item: input, action: 'published')
      create(:idea_published_campaign).generate_commands(
        activity: activity,
        recipient: recipient
      ).first.merge({ recipient: recipient })
    end
    let_it_be(:mail) { described_class.with(command: command, campaign: campaign).test_idea_published.deliver_now }

    it 'renders the subject' do
      expect(mail.subject).to eq('Your idea has been published')
    end

    it 'renders the receiver email' do
      expect(mail.to).to eq([recipient.email])
    end

    it 'renders the sender email' do
      expect(mail.from).to all(end_with('@citizenlab.co'))
    end

    it 'includes the header' do
      expect(mail.body.encoded).to have_tag('div') do
        with_tag 'h1' do
          with_text(/You posted/)
        end
      end
    end

    it 'includes the input box' do
      expect(mail.body.encoded).to have_tag('table') do
        with_tag 'p' do
          with_text(/Reach more people/)
        end
      end
    end

    it 'includes the CTA' do
      expect(mail.body.encoded).to have_tag('a', with: { href: "http://example.org/en/ideas/#{input.slug}" }) do
        with_text(/Go to your idea/)
      end
    end
  end
end
