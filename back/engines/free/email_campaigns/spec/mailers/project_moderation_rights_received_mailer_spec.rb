# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::ProjectModerationRightsReceivedMailer do
  describe 'campaign_mail' do
    let_it_be(:project) { create(:project) }
    let_it_be(:recipient) { create(:project_moderator, locale: 'en', projects: [project]) }
    let_it_be(:command) do
      {
        recipient: recipient,
        event_payload: {
          project_id: project.id,
          project_title_multiloc: { 'en' => 'Example project title' },
          project_ideas_count: 85,
          project_url: 'https://govocal.com/projects/example'
        }
      }
    end

    let(:campaign) { create(:project_moderation_rights_received_campaign) }
    let(:mailer) { described_class.with(command: command, campaign: campaign) }
    let(:mail) { mailer.campaign_mail.deliver_now }
    let(:body) { mail_body(mail) }

    before_all { EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id) }

    include_examples 'campaign delivery tracking'

    it 'renders the subject' do
      expect(mail.subject).to eq 'You became a project manager on the platform of Liege'
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
          with_text(/You became a project manager/)
        end
        with_tag 'p' do
          with_text(/An adminstrator of the participation platform of Liege just made you project manager of the following project:/)
        end
      end
    end

    it 'includes the project box' do
      expect(body).to have_tag('table') do
        with_tag 'h2' do
          with_text(/Example project title/)
        end
        with_tag 'p' do
          with_text(/85 ideas/)
        end
      end
    end

    it 'includes the CTA' do
      expect(body).to have_tag('a', with: { href: 'https://govocal.com/projects/example' }) do
        with_text(/Manage this project/)
      end
    end

    it 'includes the info box' do
      expect(body).to have_tag('table') do
        with_tag 'h2' do
          with_text(/What can you do as a project manager?/)
        end
        with_tag 'h3' do
          with_text(/Design the participatory process/)
        end
        with_tag 'p' do
          with_text(/As a project manager, you can configure how users interact within your project./)
        end
        with_tag 'h3' do
          with_text(/Provide project information/)
        end
        with_tag 'p' do
          with_text(/In order to increase the quality of the ideas you're getting, it is key to share sufficient information/)
        end
        with_tag 'h3' do
          with_text(/Moderate and analyse the input/)
        end
        with_tag 'p' do
          with_text(/Once the project is launched, the first ideas will come in./)
        end
      end
    end

    context 'with custom text' do
      let!(:global_campaign) do
        create(
          :project_moderation_rights_received_campaign,
          subject_multiloc: { 'en' => 'Custom Global Subject - {{ organizationName }}' },
          title_multiloc: { 'en' => 'NEW TITLE FOR {{ projectName }}' },
          intro_multiloc: { 'en' => 'NEW BODY TEXT {{ numberOfIdeas }}' },
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
              with_text(/NEW TITLE FOR Example project title/)
            end
            with_tag 'p' do
              with_text(/NEW BODY TEXT 85/)
            end
          end
        end

        it 'includes the CTA' do
          expect(body).to have_tag('a', with: { href: 'https://govocal.com/projects/example' }) do
            with_text(/CLICK THE GLOBAL BUTTON/)
          end
        end
      end
    end
  end
end
