# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::NewCommentForAdminMailer do
  describe 'NewCommentForAdmin' do
    let_it_be(:recipient) { create(:user, locale: 'en', first_name: 'Homer') }
    let_it_be(:campaign) { EmailCampaigns::Campaigns::NewCommentForAdmin.create! }
    let(:command) do
      {
        recipient: recipient,
        event_payload: {
          initiating_user_first_name: 'Chewbacca',
          comment_author_name: 'Chewbacca',
          comment_body_multiloc: {
            en: 'Ruh roooarrgh yrroonn wyaaaaaa ahuma hnn-rowr ma'
          },
          comment_url: 'http://localhost:3000/en/ideas/wiki-roulette',
          idea_published_at: 2.weeks.ago.iso8601,
          idea_title_multiloc: {
            en: 'Wiki Roulette'
          },
          idea_author_name: 'Bob'
        }
      }
    end

    let(:mailer) { described_class.with(command: command, campaign: campaign) }
    let(:mail) { mailer.campaign_mail.deliver_now }
    let(:body) { mail_body(mail) }

    before_all { EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id) }

    include_examples 'campaign delivery tracking'

    it 'renders the subject' do
      expect(mail.subject).to eq('A new comment has been posted on Liege\'s platform')
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
          with_text(/Homer, a new comment has been posted on your platform/)
        end
        with_tag 'p' do
          with_text(/Chewbacca added a new comment on your platform./)
        end
      end
    end

    it 'includes the input box' do
      expect(body).to have_tag('table') do
        with_tag 'h2' do
          with_text(/Wiki Roulette/)
        end
        with_tag 'p' do
          with_text(/14 days ago/)
          with_text(/by Bob/)
        end
      end
    end

    it 'includes the comment box' do
      expect(body).to have_tag('table') do
        with_text(/Chewbacca commented:/)
        with_tag 'p' do
          with_text(/Ruh roooarrgh yrroonn wyaaaaaa ahuma hnn-rowr ma/)
        end
      end
    end

    it 'includes the CTA' do
      expect(body).to have_tag('a', with: { href: 'http://localhost:3000/en/ideas/wiki-roulette' }) do
        with_text(/View Chewbacca's comment/)
      end
    end

    context 'when the comment author is anonymous' do
      before { command[:event_payload].merge!(initiating_user_first_name: nil, comment_author_name: nil) }

      it 'includes the header' do
        expect(body).to have_tag('div') do
          with_tag 'h1' do
            with_text(/Homer, a new comment has been posted on your platform/)
          end
          with_tag 'p' do
            with_text(/Anonymous user added a new comment on your platform./)
          end
        end
      end

      it 'includes the comment box' do
        expect(body).to have_tag('table') do
          with_text(/Anonymous user commented:/)
          with_tag 'p' do
            with_text(/Ruh roooarrgh yrroonn wyaaaaaa ahuma hnn-rowr ma/)
          end
        end
      end
    end

    context 'with custom text' do
      let(:mail) { described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now }

      before do
        campaign.update!(
          subject_multiloc: { 'en' => 'Custom Subject - {{ organizationName }}' },
          title_multiloc: { 'en' => 'NEW TITLE - {{ firstName }}' },
          intro_multiloc: { 'en' => '<b>NEW BODY TEXT - {{ authorName }}</b>' },
          button_text_multiloc: { 'en' => 'CLICK THE BUTTON' },
          reply_to: 'noreply@govocal.com'
        )
      end

      it 'can customise the subject' do
        expect(mail.subject).to eq 'Custom Subject - Liege'
      end

      it 'can customize the reply to email' do
        expect(mail.reply_to).to eq ['noreply@govocal.com']
      end

      it 'can customize the header and fall back to global customzations' do
        expect(mail_body(mail)).to have_tag('div') do
          with_tag 'h1' do
            with_text(/NEW TITLE - Homer/)
          end
          with_tag 'p' do
            with_text(/NEW BODY TEXT - Chewbacca/)
          end
        end
      end

      it 'can customise the CTA' do
        expect(mail_body(mail)).to have_tag('a', with: { href: 'http://localhost:3000/en/ideas/wiki-roulette' }) do
          with_text(/CLICK THE BUTTON/)
        end
      end
    end
  end
end
