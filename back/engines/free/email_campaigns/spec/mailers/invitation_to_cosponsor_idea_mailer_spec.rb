# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::InvitationToCosponsorIdeaMailer do
  describe 'campaign_mail' do
    let_it_be(:recipient) { create(:user, locale: 'en') }
    let_it_be(:author) { create(:user, first_name: 'Ned', last_name: 'Flanders') }
    let_it_be(:proposal) { create(:proposal, author: author) }
    let_it_be(:author_name) { UserDisplayNameService.new(AppConfiguration.instance, author).display_name!(proposal.author) }

    let(:campaign) { EmailCampaigns::Campaigns::InvitationToCosponsorIdea.create! }
    let(:command) do
      item = Notifications::InvitationToCosponsorIdea.new(idea: proposal)
      activity = Activity.new(item: item)
      commands = campaign.generate_commands(recipient: recipient, activity: activity)
      commands[0].merge({ recipient: recipient })
    end
    let(:mailer) { described_class.with(command: command, campaign: campaign) }
    let(:mail) { mailer.campaign_mail.deliver_now }

    before_all { EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id) }

    include_examples 'campaign delivery tracking'

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
      proposal_url = Frontend::UrlService.new.model_to_url(proposal, locale: Locale.new(recipient.locale))
      expect(mail.body.encoded).to match(proposal_url)
    end

    context 'with custom text' do
      let!(:global_campaign) do
        create(
          :invitation_to_cosponsor_idea_campaign,
          subject_multiloc: { 'en' => 'Custom Global Subject - {{ authorName }}' },
          title_multiloc: { 'en' => 'NEW TITLE FOR {{ authorName }}' },
          button_text_multiloc: { 'en' => 'CLICK THE GLOBAL BUTTON' }
        )
      end
      let!(:context_campaign) do
        create(
          :invitation_to_cosponsor_idea_campaign,
          context: proposal.phases.first,
          subject_multiloc: { 'en' => 'Custom Context Subject - {{ authorName }}' },
          intro_multiloc: { 'en' => '<b>NEW BODY TEXT</b>' },
          button_text_multiloc: { 'en' => 'CLICK THE CONTEXT BUTTON' },
          reply_to: 'noreply@govocal.com'
        )
      end

      context 'on a global campaign' do
        let(:campaign) { global_campaign }

        it 'can customise the subject' do
          expect(mail.subject).to eq "Custom Global Subject - #{author_name}"
        end

        it 'renders the reply to email' do
          expect(mail.reply_to).to eq [ENV.fetch('DEFAULT_FROM_EMAIL', 'hello@citizenlab.co')]
        end

        it 'can customize the header' do
          expect(mail_body(mail)).to have_tag('div') do
            with_tag 'h1' do
              with_text(/NEW TITLE FOR #{author_name}/)
            end
            with_tag 'p' do
              with_text(/#{author_name} has created a new proposal and would like you to co-sponsor it\./)
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
          expect(mail.subject).to eq "Custom Context Subject - #{author_name}"
        end

        it 'can customize the reply to email' do
          expect(mail.reply_to).to eq ['noreply@govocal.com']
        end

        it 'can customize the header and fall back to global customzations' do
          expect(mail_body(mail)).to have_tag('div') do
            with_tag 'h1' do
              with_text(/NEW TITLE FOR #{author_name}/)
            end
            with_tag 'p' do
              with_text(/NEW BODY TEXT/)
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
