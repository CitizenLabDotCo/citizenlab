require 'rails_helper'

RSpec.describe EmailCampaigns::SpaceModerationRightsReceivedMailer do
  describe 'campaign_mail' do
    let_it_be(:space) { create(:space) }
    let_it_be(:recipient) { create(:space_moderator, locale: 'en', spaces: [space]) }
    let_it_be(:command) do
      {
        recipient: recipient,
        event_payload: {
          space_id: space.id,
          space_title_multiloc: { 'en' => 'Example space title' },
          space_projects_count: 12,
          space_url: 'https://govocal.com/admin/projects/spaces/example'
        }
      }
    end

    let(:campaign) { create(:space_moderation_rights_received_campaign) }
    let(:mailer) { described_class.with(command: command, campaign: campaign) }
    let(:mail) { mailer.campaign_mail.deliver_now }
    let(:body) { mail_body(mail) }

    before_all { EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id) }

    include_examples 'campaign delivery tracking'

    it 'renders the subject' do
      expect(mail.subject).to eq 'You became a space manager on the platform of Liege'
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
          with_text(/You became a space manager/)
        end
        with_tag 'p' do
          with_text(/An adminstrator of the participation platform of Liege just made you space manager of the following space:/)
        end
      end
    end

    it 'includes the space box' do
      expect(body).to have_tag('table') do
        with_tag 'h2' do
          with_text(/Example space title/)
        end
        with_tag 'p' do
          with_text(/12 projects/)
        end
      end
    end

    it 'includes the CTA' do
      expect(body).to have_tag('a', with: { href: 'https://govocal.com/admin/projects/spaces/example' }) do
        with_text(/Manage this space/)
      end
    end

    it 'includes the info box' do
      expect(body).to have_tag('table') do
        with_tag 'h2' do
          with_text(/What can you do as a space manager?/)
        end
        with_tag 'h3' do
          with_text(/Organize projects and folders/)
        end
        with_tag 'p' do
          with_text(/As a space manager, you can manage projects and folders within your space/)
        end
        with_tag 'h3' do
          with_text(/Manage space settings/)
        end
        with_tag 'p' do
          with_text(/You can edit the space title and description/)
        end
        with_tag 'h3' do
          with_text(/Oversee participation/)
        end
        with_tag 'p' do
          with_text(/As a space manager, you have project manager rights/)
        end
      end
    end

    context 'with custom text' do
      let!(:global_campaign) do
        create(
          :space_moderation_rights_received_campaign,
          subject_multiloc: { 'en' => 'Custom Global Subject - {{ organizationName }}' },
          title_multiloc: { 'en' => 'NEW TITLE FOR {{ spaceName }}' },
          intro_multiloc: { 'en' => 'NEW BODY TEXT {{ numberOfProjects }}' },
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
              with_text(/NEW TITLE FOR Example space title/)
            end
            with_tag 'p' do
              with_text(/NEW BODY TEXT 12/)
            end
          end
        end

        it 'includes the CTA' do
          expect(body).to have_tag('a', with: { href: 'https://govocal.com/admin/projects/spaces/example' }) do
            with_text(/CLICK THE GLOBAL BUTTON/)
          end
        end
      end
    end
  end
end
