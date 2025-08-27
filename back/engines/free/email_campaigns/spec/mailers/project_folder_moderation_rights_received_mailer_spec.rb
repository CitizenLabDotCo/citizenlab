# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ProjectFolders::EmailCampaigns::ProjectFolderModerationRightsReceivedMailer do
  describe 'campaign_mail' do
    let_it_be(:project_folder) { create(:project_folder) }
    let_it_be(:recipient) { create(:project_folder_moderator, locale: 'en', project_folders: [project_folder]) }
    let_it_be(:command) do
      {
        recipient: recipient,
        event_payload: {
          project_folder_id: project_folder.id,
          project_folder_title_multiloc: { 'en' => 'Example folder title' },
          project_folder_projects_count: 7,
          project_folder_url: 'https://admin.folder.url'
        }
      }
    end

    let(:campaign) { create(:project_folder_moderation_rights_received_campaign) }
    let(:mailer) { described_class.with(command: command, campaign: campaign) }
    let(:mail) { mailer.campaign_mail.deliver_now }
    let(:body) { mail_body(mail) }

    before do
      EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id)
    end

    include_examples 'campaign delivery tracking'

    it 'renders the subject' do
      expect(mail.subject).to eq 'You became a project folder manager on the participation platform of Liege'
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
          with_text(/You've been added as a folder manager/)
        end
        with_tag 'p' do
          with_text(/You've been given folder manager rights on Liege's participation platform for the following folder:/)
        end
      end
    end

    it 'includes the folder box' do
      expect(body).to have_tag('table') do
        with_tag 'h2' do
          with_text(/Example folder title/)
        end
        with_tag 'p' do
          with_text(/7 projects/)
        end
      end
    end

    it 'includes the CTA' do
      expect(body).to have_tag('a', with: { href: 'https://admin.folder.url' }) do
        with_text(/View this folder/)
      end
    end

    it 'includes the info box' do
      expect(body).to have_tag('table') do
        with_tag 'h2' do
          with_text(/What can you do as a folder manager?/)
        end
        with_tag 'h3' do
          with_text(/Manage the folder settings and create new projects./)
        end
        with_tag 'p' do
          with_text(/A folder is way to organize several participation projects together./)
        end
        with_tag 'h3' do
          with_text(/Design the participatory process/)
        end
        with_tag 'p' do
          with_text(/You can manage the different participation projects within your folder/)
        end
        with_tag 'h3' do
          with_text(/Moderate and analyse the input/)
        end
        with_tag 'p' do
          with_text(/Once the projects are launched, the first inputs will start coming in./)
        end
      end
    end

    context 'with custom text' do
      let!(:global_campaign) do
        create(
          :project_folder_moderation_rights_received_campaign,
          subject_multiloc: { 'en' => 'Custom Global Subject - {{ organizationName }}' },
          title_multiloc: { 'en' => 'NEW TITLE FOR {{ numberOfProjects }}' },
          intro_multiloc: { 'en' => 'NEW BODY TEXT {{ folderName }}' },
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
              with_text(/NEW TITLE FOR 7/)
            end
            with_tag 'p' do
              with_text(/NEW BODY TEXT Example folder title/)
            end
          end
        end

        it 'includes the CTA' do
          expect(body).to have_tag('a', with: { href: 'https://admin.folder.url' }) do
            with_text(/CLICK THE GLOBAL BUTTON/)
          end
        end
      end
    end
  end
end
