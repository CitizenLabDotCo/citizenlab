# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::SurveySubmittedMailer do
  describe 'campaign_mail' do
    before_all do
      config = AppConfiguration.instance
      config.settings['core']['organization_name'] = { 'en' => 'Vaudeville' }
      config.save!
      create(:idea_status_proposed)
    end

    let_it_be(:recipient) { create(:user, locale: 'en') }
    let_it_be(:campaign) { EmailCampaigns::Campaigns::SurveySubmitted.create! }
    let_it_be(:project) { create(:single_phase_native_survey_project) }
    let_it_be(:input) { create(:idea, author: recipient, project: project, creation_phase: project.phases.first) }
    let_it_be(:command) do
      activity = create(:activity, item: input, action: 'published')
      create(:survey_submitted_campaign).generate_commands(
        activity: activity,
        recipient: recipient
      ).first.merge({ recipient: recipient })
    end
    let_it_be(:mail) { described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now }
    let_it_be(:body) { mail_body(mail) }

    it 'renders the subject' do
      expect(mail.subject).to eq('Vaudeville: Thank you for your response! 🎉')
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
          with_text(/Thank you for sharing your thoughts/)
        end
      end
    end

    it 'includes the idea id' do
      expect(body).to have_tag('p') do
        with_text(input.id)
      end
    end

    it 'includes the download button' do
      expect(body).to have_tag('a') do
        with_text(/Download your responses/)
      end
    end
  end
end
