# frozen_string_literal: true

require 'rails_helper'

# TODO: move-old-proposals-test
RSpec.describe EmailCampaigns::InvitationToCosponsorIdeaMailer do
  describe 'campaign_mail' do
    let_it_be(:recipient) { create(:user, locale: 'en') }
    let_it_be(:author) { create(:user) }
    let_it_be(:proposal) { create(:proposal, author: author) }
    let_it_be(:campaign) { EmailCampaigns::Campaigns::InvitationToCosponsorIdea.create! }
    let_it_be(:author_name) { UserDisplayNameService.new(AppConfiguration.instance, author).display_name!(proposal.author) }
    let_it_be(:command) do
      item = Notifications::InvitationToCosponsorIdea.new(idea: proposal)
      activity = Activity.new(item: item)
      commands = EmailCampaigns::Campaigns::InvitationToCosponsorIdea.new.generate_commands(recipient: recipient, activity: activity)
      commands[0].merge({ recipient: recipient })
    end

    let_it_be(:mail) { described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now }

    before_all { EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id) }

    it 'renders the subject' do
      expect(mail.subject).to start_with('You have been invited to co-sponsor a proposal')
    end

    it 'renders the receiver email' do
      expect(mail.to).to eq([recipient.email])
    end

    it 'renders the sender email' do
      expect(mail.from).to all(end_with('@citizenlab.co'))
    end

    it 'assigns proposal author name' do
      expect(mail.body.encoded).to match(author_name)
    end

    it 'assigns cta url' do
      post_url = Frontend::UrlService.new.model_to_url(proposal, locale: Locale.new(recipient.locale))
      expect(mail.body.encoded).to match(post_url)
    end
  end
end
