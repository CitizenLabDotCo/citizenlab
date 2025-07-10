# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::OfficialFeedbackOnIdeaYouFollowMailer do
  describe 'campaign_mail' do
    before_all do
      config = AppConfiguration.instance
      config.settings['core']['organization_name'] = { 'en' => 'Vaudeville' }
      config.save!
    end

    let_it_be(:recipient) { create(:user, locale: 'en') }
    let_it_be(:idea_author) { create(:user, first_name: 'Kermit', last_name: 'the Frog') }
    let_it_be(:input) { create(:idea, title_multiloc: { 'en' => 'Input title' }, body_multiloc: { 'en' => 'Input body' }, author: idea_author) }
    let_it_be(:feedback_author_multiloc) { { 'en' => 'Gonzo' } }
    let_it_be(:feedback) { create(:official_feedback, body_multiloc: { 'en' => 'We appreciate your participation' }, idea: input, author_multiloc: feedback_author_multiloc) }
    let_it_be(:campaign) { EmailCampaigns::Campaigns::OfficialFeedbackOnIdeaYouFollow.create! }
    let_it_be(:notification) { create(:official_feedback_on_idea_you_follow, recipient: recipient, idea: input, official_feedback: feedback) }
    let_it_be(:command) do
      activity = create(:activity, item: notification, action: 'created')
      create(:official_feedback_on_idea_you_follow_campaign).generate_commands(
        activity: activity,
        recipient: recipient
      ).first.merge({ recipient: recipient })
    end
    let_it_be(:mailer) { described_class.with(command: command, campaign: campaign) }
    let_it_be(:mail) { mailer.campaign_mail.deliver_now }
    let_it_be(:body) { mail_body(mail) }

    include_examples 'campaign delivery tracking'

    it 'renders the subject' do
      expect(mail.subject).to eq('Official feedback was posted on "Input title"')
    end

    it 'renders the sender email' do
      expect(mail.from).to all(end_with('@citizenlab.co'))
    end

    it 'includes the header' do
      expect(body).to have_tag('div') do
        with_tag 'h1' do
          with_text(/There's an update on "Input title"/)
        end
        with_tag 'p' do
          with_text(/Gonzo gave an update on 'Input title'\./)
        end
      end
    end

    it 'includes the input box' do
      expect(body).to have_tag('table') do
        with_tag 'h2' do
          with_text(/Input title/)
        end
        with_tag 'p' do
          with_text(/Input body/)
        end
        with_tag 'p' do
          with_text(/Kermit the Frog/)
        end
      end
    end

    it 'includes the official feedback box' do
      expect(body).to have_tag('table') do
        with_tag 'div' do
          with_text(/Gonzo wrote:/)
        end
        with_tag 'p' do
          with_text(/We appreciate your participation/)
        end
      end
    end

    it 'includes the CTA' do
      expect(body).to have_tag('a', with: { href: "http://example.org/en/ideas/#{input.slug}" }) do
        with_text(/Go to this idea/)
      end
    end

    it 'includes the unfollow url' do
      expect(body).to match(Frontend::UrlService.new.unfollow_url(Follower.new(followable: input, user: recipient)))
    end

    context 'with custom text' do
      let(:mail) { described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now }

      before do
        campaign.update!(
          subject_multiloc: { 'en' => 'Custom Subject - {{ organizationName }}' },
          title_multiloc: { 'en' => 'NEW TITLE - {{ input_title }}' },
          intro_multiloc: { 'en' => '<b>NEW BODY TEXT - {{ feedback_author_name }}</b>' }
        )
      end

      it 'can customise the subject' do
        expect(mail.subject).to eq 'Custom Subject - Vaudeville'
      end

      it 'can customise the title' do
        expect(mail_body(mail)).to include('NEW TITLE - Input title')
      end

      it 'can customise the body including HTML' do
        expect(mail_body(mail)).to include('<b>NEW BODY TEXT - Gonzo</b>')
      end
    end
  end
end
