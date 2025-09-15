# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::ManualCampaignMailer do
  describe 'campaign_mail' do
    let_it_be(:recipient) { create(:user, locale: 'en', first_name: 'Manuel', last_name: 'Campene') }

    let(:command) do
      campaign.generate_commands(recipient:).first.merge({ recipient: recipient })
    end
    let(:mailer) { described_class.with(command:, campaign:) }
    let(:mail) { mailer.campaign_mail.deliver_now }
    let(:body) { mail_body(mail) }

    before_all { EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id) }

    context 'for a global manual campaign' do
      let(:campaign) do
        EmailCampaigns::Campaigns::Manual.create!(
        subject_multiloc: { 'en' => 'Title' },
        body_multiloc: {
          'en' => '
            <h2>{{ first_name }} {{ last_name }}</h2>
            <p> Here\'s your test email</p>
          '
        },
        sender: 'organization'
      )
    end

      include_examples 'campaign delivery tracking'

      it 'renders the subject' do
        expect(mail.subject).to end_with('Title')
      end

      it 'renders the receiver email' do
        expect(mail.to).to eq([recipient.email])
      end

      it 'renders the sender email' do
        expect(mail.from).to all(end_with('@citizenlab.co'))
      end

      it 'includes the preheader' do
        expect(body).to have_tag('div') do
          with_text(/You have mail from Liege/)
        end
      end

      it 'includes the header' do
        expect(body).to have_tag('h2') do
          with_text(/Manuel Campene/)
        end
      end

      it 'includes the paragraph' do
        expect(body).to have_tag('p') do
          with_text(/Here's your test email/)
        end
      end
    end

    context 'for a manual project participants campaign' do
      let(:campaign) do
        EmailCampaigns::Campaigns::ManualProjectParticipants.create!(
          subject_multiloc: { 'en' => 'Title' },
          body_multiloc: {
            'en' => '
              <h2>{{ first_name }} {{ last_name }}</h2>
              <p> Here\'s your test email</p>
            '
          },
          sender: 'organization',
          context: create(:project)
        )
      end

      include_examples 'campaign delivery tracking'

      it 'renders the subject' do
        expect(mail.subject).to end_with('Title')
      end

      it 'renders the receiver email' do
        expect(mail.to).to eq([recipient.email])
      end

      it 'renders the sender email' do
        expect(mail.from).to all(end_with('@citizenlab.co'))
      end

      it 'includes the preheader' do
        expect(body).to have_tag('div') do
          with_text(/You have mail from Liege/)
        end
      end

      it 'includes the header' do
        expect(body).to have_tag('h2') do
          with_text(/Manuel Campene/)
        end
      end

      it 'includes the paragraph' do
        expect(body).to have_tag('p') do
          with_text(/Here's your test email/)
        end
      end
    end
  end
end
