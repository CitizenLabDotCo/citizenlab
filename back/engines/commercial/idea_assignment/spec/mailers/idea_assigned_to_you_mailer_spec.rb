# frozen_string_literal: true

require 'rails_helper'

RSpec.describe IdeaAssignment::EmailCampaigns::IdeaAssignedToYouMailer do
  describe 'campaign_mail' do
    let_it_be(:recipient) { create(:user, first_name: 'Remy', locale: 'en') }
    let_it_be(:command) do
      {
        recipient: recipient,
        event_payload: {
          post_title_multiloc: { 'en' => 'Example idea title' },
          post_body_multiloc: { 'en' => 'Example idea body' },
          post_author_name: 'Aude Horname',
          post_url: 'https://govocal.com/ideas/example'
        }
      }
    end

    let(:campaign) { create(:idea_assigned_to_you_campaign) }
    let(:mailer) { described_class.with(command: command, campaign: campaign) }
    let(:mail) { mailer.campaign_mail.deliver_now }
    let(:body) { mail_body(mail) }

    before_all { EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id) }

    include_examples 'campaign delivery tracking'

    it 'renders the subject' do
      expect(mail.subject).to eq 'You have an assignment on the platform of Liege'
    end

    it 'renders the receiver email' do
      expect(mail.to).to eq([recipient.email])
    end

    it 'renders the sender email' do
      expect(mail.from).to all(end_with('@citizenlab.co'))
    end

    it 'includes the header' do
      expect(body).to have_tag('div') do
        with_tag 'h1' do
          with_text(/Remy, an input was assigned to you/)
        end
        with_tag 'p' do
          with_text(/An idea has been assigned to you. Give feedback by writing an official update or by changing its status./)
        end
      end
    end

    it 'includes the idea box' do
      expect(body).to have_tag('table') do
        with_tag 'h2' do
          with_text(/Example idea title/)
        end
        with_tag 'p' do
          with_text(/by Aude Horname/)
        end
        with_tag 'p' do
          with_text(/Example idea body/)
        end
      end
    end

    it 'includes the CTA' do
      expect(body).to have_tag('a', with: { href: 'http://example.org/admin/ideas' }) do
        with_text(/Give feedback to Aude Horname/)
      end
    end

    context 'with custom text' do
      let!(:global_campaign) do
        create(
          :idea_assigned_to_you_campaign,
          subject_multiloc: { 'en' => 'Custom Global Subject - {{ organizationName }}' },
          title_multiloc: { 'en' => 'NEW TITLE FOR {{ firstName }}' },
          intro_multiloc: { 'en' => 'NEW BODY TEXT by {{ authorName }}' },
          button_text_multiloc: { 'en' => 'CLICK THE GLOBAL BUTTON' }
        )
      end

      context 'on a global campaign' do
        let(:campaign) { global_campaign }

        it 'can customise the subject' do
          expect(mail.subject).to eq 'Custom Global Subject - Liege'
        end

        it 'renders the reply to email' do
          expect(mail.reply_to).to eq [ENV.fetch('DEFAULT_FROM_EMAIL', 'hello@citizenlab.co')]
        end

        it 'can customize the header' do
          expect(body).to have_tag('div') do
            with_tag 'h1' do
              with_text(/NEW TITLE FOR Remy/)
            end
            with_tag 'p' do
              with_text(/NEW BODY TEXT by Aude Horname/)
            end
          end
        end

        it 'includes the CTA' do
          expect(body).to have_tag('a', with: { href: 'http://example.org/admin/ideas' }) do
            with_text(/CLICK THE GLOBAL BUTTON/)
          end
        end
      end
    end
  end
end
