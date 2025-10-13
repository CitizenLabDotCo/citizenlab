# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::ProjectReviewRequestMailer do
  describe 'campaign_mail' do
    let_it_be(:recipient) { create(:user, locale: 'en') }
    let_it_be(:event_payload) do
      {
        project_title_multiloc: { 'en' => 'Example project title' },
        project_description_multiloc: { 'en' => 'Example project description' },
        admin_project_url: 'https://example.com/admin/projects/1',
        requester_name: 'Mo Derator'
      }
    end
    let_it_be(:command) { { recipient: recipient, event_payload: event_payload } }

    let(:campaign) { create(:project_review_request_campaign) }
    let(:mailer) { described_class.with(command: command, campaign: campaign) }
    let(:mail) { mailer.campaign_mail.deliver_now }
    let(:body) { mail_body(mail) }

    include_examples 'campaign delivery tracking'

    it 'has the correct subject' do
      expect(mail.subject).to eq('Review request: A project is waiting for approval.')
    end

    it 'sends to email to the correct recipient' do
      expect(mail.to).to eq([recipient.email])
    end

    it 'has the correct sender address' do
      expect(mail.from).to all(end_with('@citizenlab.co'))
    end

    it 'includes the header' do
      expect(body).to have_tag('div') do
        with_tag 'h1' do
          with_text(/Mo Derator has invited you to review the project "Example project title"/)
        end
        with_tag 'p' do
          with_text(/Currently, the project is in draft mode and isn't visible to users. Once you've reviewed and approved it, the moderator will be able to publish it./)
        end
      end
    end

    it 'includes the project box' do
      expect(body).to have_tag('table') do
        with_tag 'h2' do
          with_text(/Example project title/)
        end
        with_tag 'p' do
          with_text(/Example project description/)
        end
      end
    end

    it 'includes the CTA' do
      expect(body).to have_tag('a', with: { href: 'https://example.com/admin/projects/1' }) do
        with_text(/Review the project/)
      end
    end

    context 'with custom text' do
      let!(:global_campaign) do
        create(
          :project_review_request_campaign,
          subject_multiloc: { 'en' => 'Custom Global Subject - {{ organizationName }}' },
          title_multiloc: { 'en' => 'NEW TITLE FOR {{ requesterName }}' },
          intro_multiloc: { 'en' => 'NEW BODY TEXT {{ projectTitle }}' },
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
              with_text(/NEW TITLE FOR Mo Derator/)
            end
            with_tag 'p' do
              with_text(/NEW BODY TEXT Example project title/)
            end
          end
        end

        it 'includes the CTA' do
          expect(body).to have_tag('a', with: { href: 'https://example.com/admin/projects/1' }) do
            with_text(/CLICK THE GLOBAL BUTTON/)
          end
        end
      end
    end
  end
end
