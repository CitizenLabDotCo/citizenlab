# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::AssigneeDigestMailer do
  describe 'AssigneeDigest' do
    let_it_be(:recipient) { create(:admin, locale: 'en') }
    let_it_be(:campaign) { EmailCampaigns::Campaigns::AssigneeDigest.create! }
    let_it_be(:assigned_at) { Time.now }
    let_it_be(:ideas) { create_list(:idea, 3, assignee: create(:admin), assigned_at: assigned_at) }
    let_it_be(:proposals) { create_list(:proposal, 3, assignee: create(:admin), assigned_at: assigned_at) }
    let_it_be(:command) do
      name_service = UserDisplayNameService.new(AppConfiguration.instance, recipient)

      {
        recipient: recipient,
        event_payload: {
          assigned_inputs: ideas.map do |idea|
            {
              id: idea.id,
              title_multiloc: idea.title_multiloc,
              url: Frontend::UrlService.new.model_to_url(idea),
              published_at: idea.published_at&.iso8601 || Time.now.iso8601,
              assigned_at: idea.assigned_at&.iso8601 || Time.now.iso8601,
              author_name: name_service.display_name!(idea.author),
              likes_count: idea.likes_count,
              dislikes_count: idea.dislikes_count,
              comments_count: idea.comments_count
            }
          end,
          successful_assigned_inputs: proposals.map do |proposal|
            {
              id: proposal.id,
              title_multiloc: proposal.title_multiloc,
              url: Frontend::UrlService.new.model_to_url(proposal),
              published_at: proposal.published_at&.iso8601 || Time.now.iso8601,
              assigned_at: proposal.assigned_at&.iso8601 || Time.now.iso8601,
              author_name: name_service.display_name!(proposal.author),
              likes_count: proposal.likes_count,
              comments_count: proposal.comments_count
            }
          end,
          need_feedback_assigned_inputs_count: 5
        }
      }
    end

    let_it_be(:mailer) { described_class.with(command: command, campaign: campaign) }
    let_it_be(:mail) { mailer.campaign_mail.deliver_now }

    before_all { EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id) }

    include_examples 'campaign delivery tracking'

    it 'renders the subject' do
      expect(mail.subject).to start_with('Inputs requiring your feedback')
    end

    it 'renders the receiver email' do
      expect(mail.to).to eq([recipient.email])
    end

    it 'renders the sender email' do
      expect(mail.from).to all(end_with('@citizenlab.co'))
    end

    it 'assigns organisation name' do
      expect(mail_body(mail)).to match(AppConfiguration.instance.settings('core', 'organization_name', 'en'))
    end

    context 'when editable regions are customised' do
      let(:mail) { described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now }

      before do
        campaign.update!(
          subject_multiloc: { 'en' => 'Custom Subject - {{ numberIdeas }}' },
          title_multiloc: { 'en' => 'NEW TITLE FOR {{ firstName }}' },
          button_text_multiloc: { 'en' => 'CLICK ME PLEASE' }
        )
      end

      it 'can customise the subject' do
        expect(mail.subject).to eq 'Custom Subject - 5'
      end

      it 'can customise the title' do
        expect(mail_body(mail)).to include('NEW TITLE FOR')
      end

      it 'can customise the button text' do
        expect(mail_body(mail)).to include('CLICK ME PLEASE')
      end
    end
  end
end
