# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::ProjectReviewStateChangeMailer do
  describe 'campaign_mail' do
    let_it_be(:project_review) { create(:project_review) }
    let_it_be(:recipient) { project_review.reviewer }
    let_it_be(:event_payload) { { project_review_id: project_review.id } }
    let_it_be(:mail) do
      campaign = EmailCampaigns::Campaigns::ProjectReviewStateChange.create!
      command = { recipient: recipient, event_payload: event_payload }
      described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now
    end

    it 'has the correct subject' do
      project_title = project_review.project.title_multiloc['en']
      expected_subject = %("#{project_title}" has been approved)
      expect(mail.subject).to eq(expected_subject)
    end

    it 'sends to email to the correct recipient' do
      expect(mail.to).to eq([recipient.email])
    end

    it 'has the correct sender address' do
      expect(mail.from).to all(end_with('@citizenlab.co'))
    end

    describe 'body' do
      let_it_be(:page) do
        body = mail.html_part.body.decoded
        Capybara::Node::Simple.new(body)
      end

      it 'contains the correct header' do
        reviewer_name = project_review.reviewer.full_name
        project_title = project_review.project.title_multiloc['en']
        expected_header = %(#{reviewer_name} approved the project "#{project_title}")
        expect(page).to have_css('h1', text: expected_header)
      end

      it 'has a "Go to project settings" button with the correct link' do
        settings_url = Frontend::UrlService.new.admin_project_url(project_review.project_id)
        expect(page).to have_css(%(a[href="#{settings_url}"]), text: 'Go to project settings')
      end

      it 'contains the project preview card' do
        # Check for presence of:
        #   <h2 ...> Project title </div>
        #   <p ...> Project preview description </p>
        h2 = page.find('h2', text: project_review.project.title_multiloc['en'])
        expect(h2).to have_css('+ p', text: project_review.project.description_preview_multiloc['en'])
      end
    end
  end
end
