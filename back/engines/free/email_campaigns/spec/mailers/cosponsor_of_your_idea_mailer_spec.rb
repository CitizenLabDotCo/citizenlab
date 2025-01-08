# frozen_string_literal: true

require 'rails_helper'

# TODO: move-old-proposals-test
RSpec.describe EmailCampaigns::CosponsorOfYourIdeaMailer do
  describe 'campaign_mail' do
    let_it_be(:recipient) { create(:user, locale: 'en') }
    let_it_be(:author) { create(:user) }
    let_it_be(:cosponsor) { create(:user) }
    let_it_be(:proposal) { create(:proposal, author: author) }
    let_it_be(:campaign) { EmailCampaigns::Campaigns::CosponsorOfYourIdea.create! }
    let_it_be(:cosponsor_name) { UserDisplayNameService.new(AppConfiguration.instance, cosponsor).display_name!(cosponsor) }
    let_it_be(:command) do
      item = Notifications::CosponsorOfYourIdea.new(idea: proposal, initiating_user: cosponsor)
      activity = Activity.new(item: item, user: author)
      commands = EmailCampaigns::Campaigns::CosponsorOfYourIdea.new.generate_commands(recipient: recipient, activity: activity)
      commands[0].merge({ recipient: recipient })
    end

    let_it_be(:mail) { described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now }

    before_all { EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id) }

    it 'renders the subject' do
      expect(mail.subject).to match('has accepted your invitation to co-sponsor your proposal')
    end

    it 'renders the receiver email' do
      expect(mail.to).to eq([recipient.email])
    end

    it 'renders the sender email' do
      expect(mail.from).to all(end_with('@citizenlab.co'))
    end

    it 'assigns proposal cosponsor name' do
      expect(mail.body.encoded).to match(cosponsor_name)
    end

    it 'assigns cta url' do
      proposal_url = Frontend::UrlService.new.model_to_url(proposal, locale: Locale.new(recipient.locale))
      expect(mail.body.encoded).to match(proposal_url)
    end
  end
end
