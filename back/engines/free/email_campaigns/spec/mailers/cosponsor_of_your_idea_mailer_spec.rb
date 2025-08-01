# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::CosponsorOfYourIdeaMailer do
  describe 'campaign_mail' do
    let_it_be(:recipient) { create(:user, locale: 'en') }
    let_it_be(:author) { create(:user, first_name: 'Bob', last_name: 'Smith') }
    let_it_be(:cosponsor) { create(:user, first_name: 'Sarah', last_name: 'Jones') }
    let_it_be(:proposal) { create(:proposal, author: author) }
    let_it_be(:campaign) { EmailCampaigns::Campaigns::CosponsorOfYourIdea.create! }
    let_it_be(:cosponsor_name) { UserDisplayNameService.new(AppConfiguration.instance, cosponsor).display_name!(cosponsor) }
    let_it_be(:command) do
      item = Notifications::CosponsorOfYourIdea.new(idea: proposal, initiating_user: cosponsor)
      activity = Activity.new(item: item, user: author)
      commands = EmailCampaigns::Campaigns::CosponsorOfYourIdea.new.generate_commands(recipient: recipient, activity: activity)
      commands[0].merge({ recipient: recipient })
    end

    let_it_be(:mailer) { described_class.with(command: command, campaign: campaign) }
    let_it_be(:mail) { mailer.campaign_mail.deliver_now }

    before_all { EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id) }

    include_examples 'campaign delivery tracking'

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

    context 'with custom text' do
      let(:mail) { described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now }

      before do
        campaign.update!(
          subject_multiloc: { 'en' => 'Custom Subject - {{ cosponsorName }}' },
          title_multiloc: { 'en' => 'NEW TITLE FOR {{ cosponsorName }}' },
          intro_multiloc: { 'en' => '<b>NEW BODY TEXT FOR {{ cosponsorName }}</b>' },
          button_text_multiloc: { 'en' => 'CLICK THE BUTTON' }
        )
      end

      it 'can customise the subject' do
        expect(mail.subject).to eq 'Custom Subject - Sarah Jones'
      end

      it 'can customise the title' do
        expect(mail_body(mail)).to include('NEW TITLE FOR Sarah Jones')
      end

      it 'can customise the body including HTML' do
        expect(mail_body(mail)).to include('<b>NEW BODY TEXT FOR Sarah Jones</b>')
      end

      it 'can customise the cta button' do
        expect(mail_body(mail)).to include('CLICK THE BUTTON')
      end
    end
  end
end
