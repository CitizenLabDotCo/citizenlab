# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::CosponsorOfYourIdeaMailer do
  describe 'campaign_mail' do
    let_it_be(:recipient) { create(:user, locale: 'en') }
    let_it_be(:author) { create(:user, first_name: 'Bob', last_name: 'Smith') }
    let_it_be(:cosponsor) { create(:user, first_name: 'Sarah', last_name: 'Jones') }
    let_it_be(:proposal) { create(:proposal, author: author) }
    let_it_be(:cosponsor_name) { UserDisplayNameService.new(AppConfiguration.instance, cosponsor).display_name!(cosponsor) }

    let(:campaign) { EmailCampaigns::Campaigns::CosponsorOfYourIdea.create! }
    let(:command) do
      item = Notifications::CosponsorOfYourIdea.new(idea: proposal, initiating_user: cosponsor)
      activity = Activity.new(item: item, user: author)
      commands = campaign.generate_commands(recipient: recipient, activity: activity)
      commands[0].merge({ recipient: recipient })
    end
    let(:mailer) { described_class.with(command: command, campaign: campaign) }
    let(:mail) { mailer.campaign_mail.deliver_now }

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
      let!(:global_campaign) do
        create(
          :cosponsor_of_your_idea_campaign,
          subject_multiloc: { 'en' => 'Custom Global Subject - {{ cosponsorName }}' },
          title_multiloc: { 'en' => 'NEW TITLE FOR {{ cosponsorName }}' },
          button_text_multiloc: { 'en' => 'CLICK THE GLOBAL BUTTON' }
        )
      end
      let!(:context_campaign) do
        create(
          :cosponsor_of_your_idea_campaign,
          context: proposal.phases.first,
          subject_multiloc: { 'en' => 'Custom Context Subject - {{ cosponsorName }}' },
          intro_multiloc: { 'en' => '<b>NEW BODY TEXT FOR {{ cosponsorName }}</b>' },
          button_text_multiloc: { 'en' => 'CLICK THE CONTEXT BUTTON' },
          reply_to: 'noreply@govocal.com'
        )
      end

      context 'on a global campaign' do
        let(:campaign) { global_campaign }

        it 'can customise the subject' do
          expect(mail.subject).to eq 'Custom Global Subject - Sarah Jones'
        end

        it 'renders the reply to email' do
          expect(mail.reply_to).to eq [ENV.fetch('DEFAULT_FROM_EMAIL', 'hello@citizenlab.co')]
        end

        it 'can customize the header' do
          expect(mail_body(mail)).to have_tag('div') do
            with_tag 'h1' do
              with_text(/NEW TITLE FOR Sarah Jones/)
            end
            with_tag 'p' do
              with_text(/Sarah Jones has accepted your invitation to co-sponsor your proposal\./)
            end
          end
        end

        it 'can customise the CTA' do
          expect(mail_body(mail)).to have_tag('a', with: { href: command.dig(:event_payload, :idea_url) }) do
            with_text(/CLICK THE GLOBAL BUTTON/)
          end
        end
      end

      context 'on a context campaign' do
        let(:campaign) { context_campaign }

        it 'can customise the subject' do
          expect(mail.subject).to eq 'Custom Context Subject - Sarah Jones'
        end

        it 'can customize the reply to email' do
          expect(mail.reply_to).to eq ['noreply@govocal.com']
        end

        it 'can customize the header and fall back to global customzations' do
          expect(mail_body(mail)).to have_tag('div') do
            with_tag 'h1' do
              with_text(/NEW TITLE FOR Sarah Jones/)
            end
            with_tag 'p' do
              with_text(/NEW BODY TEXT FOR Sarah Jones/)
            end
          end
        end

        it 'can customise the CTA' do
          expect(mail_body(mail)).to have_tag('a', with: { href: command.dig(:event_payload, :idea_url) }) do
            with_text(/CLICK THE CONTEXT BUTTON/)
          end
        end
      end
    end
  end
end
