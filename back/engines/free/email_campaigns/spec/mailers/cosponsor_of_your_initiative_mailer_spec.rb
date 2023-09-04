# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::CosponsorOfYourInitiativeMailer do
  describe 'campaign_mail' do
    let_it_be(:recipient) { create(:user, locale: 'en') }
    let_it_be(:author) { create(:user) }
    let_it_be(:cosponsor) { create(:user) }
    let_it_be(:initiative) { create(:initiative, author: author) }
    let_it_be(:campaign) { EmailCampaigns::Campaigns::CosponsorOfYourInitiative.create! }
    let_it_be(:cosponsor_name) { UserDisplayNameService.new(AppConfiguration.instance, cosponsor).display_name!(cosponsor) }
    let_it_be(:command) do
      item = Notifications::CosponsorOfYourInitiative.new(post: initiative, initiating_user: cosponsor)
      activity = Activity.new(item: item, user: author)
      commands = EmailCampaigns::Campaigns::CosponsorOfYourInitiative.new.generate_commands(recipient: recipient, activity: activity)
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

    it 'assigns initiative cosponsor name' do
      expect(mail.body.encoded).to match(cosponsor_name)
    end

    it 'assigns cta url' do
      post_url = Frontend::UrlService.new.model_to_url(initiative, locale: recipient.locale)
      expect(mail.body.encoded).to match(post_url)
    end
  end
end
