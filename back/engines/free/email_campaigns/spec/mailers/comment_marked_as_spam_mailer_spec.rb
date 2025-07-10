# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::CommentMarkedAsSpamMailer do
  describe 'campaign_mail' do
    let_it_be(:recipient) { create(:user, locale: 'en') }
    let_it_be(:campaign) { EmailCampaigns::Campaigns::CommentMarkedAsSpam.create! }
    let_it_be(:initiating_user) { create(:user, first_name: 'John', last_name: 'Doe') }
    let_it_be(:comment) { create(:comment, author: recipient) }
    let_it_be(:command) do
      {
        recipient: recipient,
        event_payload: {
          initiating_user_first_name: initiating_user.first_name,
          initiating_user_last_name: initiating_user.last_name,
          idea_title_multiloc: comment.idea.title_multiloc,
          comment_author_name: comment.author_name,
          comment_body_multiloc: comment.body_multiloc,
          comment_url: Frontend::UrlService.new.model_to_url(comment, locale: Locale.new(recipient.locale)),
          spam_report_reason_code: 'inappropriate',
          spam_report_other_reason: nil
        }
      }
    end

    let_it_be(:mailer) { described_class.with(command: command, campaign: campaign) }
    let_it_be(:mail) { mailer.campaign_mail.deliver_now }

    before_all do
      EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id)
    end

    include_examples 'campaign delivery tracking'

    it 'renders the subject' do
      expect(mail.subject).to end_with('reported this comment as spam')
    end

    it 'renders the receiver email' do
      expect(mail.to).to eq([recipient.email])
    end

    it 'renders the sender email' do
      expect(mail.from).to all(end_with('@citizenlab.co'))
    end

    it 'assigns reporter\'s name' do
      expect(mail_body(mail)).to match(initiating_user.first_name)
    end

    it 'assigns the reason' do
      expect(mail_body(mail)).to match('The comment is inappropriate or offensive.')
    end

    it 'assigns go to comment CTA' do
      comment_url = Frontend::UrlService.new.model_to_url(comment, locale: Locale.new(recipient.locale))
      expect(mail_body(mail)).to match(comment_url)
    end

    context 'with custom text' do
      let(:mail) { described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now }

      before do
        campaign.update!(
          subject_multiloc: { 'en' => 'Custom Subject - {{ organizationName }}' },
          title_multiloc: { 'en' => 'NEW TITLE FOR {{ organizationName }}' },
          intro_multiloc: { 'en' => '<b>NEW BODY TEXT - {{ post }}</b>' },
          button_text_multiloc: { 'en' => 'CLICK THE BUTTON - {{ firstName }} {{ lastName }}' }
        )
      end

      it 'can customise the subject' do
        expect(mail.subject).to eq 'Custom Subject - Liege'
      end

      it 'can customise the title' do
        expect(mail_body(mail)).to include('NEW TITLE FOR Liege')
      end

      it 'can customise the body including HTML' do
        expect(mail_body(mail)).to include('<b>NEW BODY TEXT - Plant more trees</b>')
      end

      it 'can customise the cta button' do
        expect(mail_body(mail)).to include('CLICK THE BUTTON - John Doe')
      end
    end
  end
end
