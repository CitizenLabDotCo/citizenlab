# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::StatusChangeOnIdeaYouFollowMailer do
  describe 'campaign_mail' do
    before_all do
      config = AppConfiguration.instance
      config.settings['core']['organization_name'] = { 'en' => 'Vaudeville' }
      config.save!
    end

    let_it_be(:recipient) { create(:user, locale: 'en') }
    let_it_be(:status) { create(:idea_status, title_multiloc: { 'en' => "On the president's desk" }) }
    let_it_be(:input) { create(:idea, title_multiloc: { 'en' => 'Input title' }, idea_status: status) }

    let(:campaign) { create(:status_change_on_idea_you_follow_campaign) }
    let(:command) do
      campaign.generate_commands(
        recipient: recipient,
        activity: build(:activity, item: build(:notification, idea: input))
      ).first.merge({ recipient: recipient })
    end
    let(:mailer) { described_class.with(command: command, campaign: campaign) }
    let(:mail) { mailer.campaign_mail.deliver_now }
    let(:body) { mail_body(mail) }

    before { EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id) }

    include_examples 'campaign delivery tracking'

    it 'renders the subject' do
      expect(mail.subject).to eq('The status of "Input title" has changed')
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
          with_text(/An input you follow has a new status/)
        end
        with_tag 'p' do
          with_text(/Vaudeville updated the status of the input 'Input title' on their digital participation platform./)
        end
      end
    end

    it 'includes the new status box' do
      expect(body).to have_tag('table') do
        with_tag 'div' do
          with_text(/The new status of this input is 'On the president's desk'/)
        end
      end
    end

    it 'includes the CTA' do
      expect(body).to have_tag('a', with: { href: "http://example.org/en/ideas/#{input.slug}" }) do
        with_text(/Go to this input/)
      end
    end

    it 'includes the unfollow url' do
      expect(body).to match(Frontend::UrlService.new.unfollow_url(Follower.new(followable: input, user: recipient)))
    end

    context 'with custom text' do
      let!(:global_campaign) do
        create(
          :status_change_on_idea_you_follow_campaign,
          subject_multiloc: { 'en' => 'Custom Global Subject - {{ organizationName }}' },
          title_multiloc: { 'en' => 'NEW TITLE FOR {{ status }}' },
          button_text_multiloc: { 'en' => 'CLICK THE GLOBAL BUTTON' }
        )
      end
      let!(:context_campaign) do
        create(
          :status_change_on_idea_you_follow_campaign,
          context: create(:phase),
          subject_multiloc: { 'en' => 'Custom Context Subject - {{ input_title }}' },
          intro_multiloc: { 'en' => '<b>NEW BODY TEXT</b>' },
          button_text_multiloc: { 'en' => 'CLICK THE CONTEXT BUTTON' },
          reply_to: 'noreply@govocal.com'
        )
      end

      context 'on a global campaign' do
        let(:campaign) { global_campaign }

        it 'can customise the subject' do
          expect(mail.subject).to eq 'Custom Global Subject - Vaudeville'
        end

        it 'renders the reply to email' do
          expect(mail.reply_to).to eq [ENV.fetch('DEFAULT_FROM_EMAIL', 'hello@citizenlab.co')]
        end

        it 'can customize the header' do
          expect(body).to have_tag('div') do
            with_tag 'h1' do
              with_text(/NEW TITLE FOR On the president's desk/)
            end
            with_tag 'p' do
              with_text(/Vaudeville updated the status of the input 'Input title' on their digital participation platform./)
            end
          end
        end

        it 'includes the CTA' do
          expect(body).to have_tag('a', with: { href: "http://example.org/en/ideas/#{input.slug}" }) do
            with_text(/CLICK THE GLOBAL BUTTON/)
          end
        end
      end

      context 'on a context campaign' do
        let(:campaign) { context_campaign }

        it 'can customise the subject' do
          expect(mail.subject).to eq 'Custom Context Subject - Input title'
        end

        it 'can customize the reply to email' do
          expect(mail.reply_to).to eq ['noreply@govocal.com']
        end

        it 'can customize the header and fall back to global customzations' do
          expect(body).to have_tag('div') do
            with_tag 'h1' do
              with_text(/NEW TITLE FOR On the president's desk/)
            end
            with_tag 'p' do
              with_text(/NEW BODY TEXT/)
            end
          end
        end

        it 'includes the CTA' do
          expect(body).to have_tag('a', with: { href: "http://example.org/en/ideas/#{input.slug}" }) do
            with_text(/CLICK THE CONTEXT BUTTON/)
          end
        end
      end
    end
  end
end
