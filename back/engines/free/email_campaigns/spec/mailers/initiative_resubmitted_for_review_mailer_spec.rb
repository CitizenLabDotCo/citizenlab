# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::InitiativeResubmittedForReviewMailer do
  describe 'campaign_mail' do
    let_it_be(:recipient) { create(:user, locale: 'en') }
    let_it_be(:author) { create(:user) }
    let_it_be(:initiative) { create(:initiative, author: author) }
    let_it_be(:campaign) { EmailCampaigns::Campaigns::InitiativeResubmittedForReview.create! }
    let_it_be(:author_name) { UserDisplayNameService.new(AppConfiguration.instance, author).display_name!(initiative.author) }
    let_it_be(:command) do
      item = Notifications::InitiativeResubmittedForReview.new(post: initiative)
      activity = Activity.new(item: item)
      commands = EmailCampaigns::Campaigns::InitiativeResubmittedForReview.new.generate_commands(recipient: recipient, activity: activity)
      commands[0].merge({ recipient: recipient })
    end

    let_it_be(:mail) { described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now }

    before_all { EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id) }

    it 'renders the subject' do
      expect(mail.subject).to start_with('You have a proposal to review on the platform of')
    end

    it 'renders the receiver email' do
      expect(mail.to).to eq([recipient.email])
    end

    it 'renders the sender email' do
      expect(mail.from).to all(end_with('@citizenlab.co'))
    end

    it 'assigns initiative author name' do
      expect(mail.body.encoded).to match(author_name)
    end

    it 'assigns cta url' do
      admin_initiatives_url = Frontend::UrlService.new.admin_initiatives_url
      expect(mail.body.encoded).to match(admin_initiatives_url)
    end
  end
end
