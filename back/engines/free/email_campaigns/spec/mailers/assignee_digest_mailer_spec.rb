require 'rails_helper'

RSpec.describe EmailCampaigns::AssigneeDigestMailer, type: :mailer do
  describe 'AssigneeDigest' do
    let!(:recipient) { create(:admin, locale: 'en') }
    let!(:campaign) { EmailCampaigns::Campaigns::AssigneeDigest.create! }
    
    let(:assigned_at) { Time.now }
    let(:ideas) { create_list(:assigned_idea, 3, assigned_at: assigned_at) }
    let(:initiatives) { create_list(:assigned_initiative, 3, assigned_at: assigned_at) }
    let(:name_service) { UserDisplayNameService.new(AppConfiguration.instance, recipient) }
    let(:command) do {
        recipient: recipient,
        event_payload: {
          assigned_ideas: ideas.map{ |idea| {
            id: idea.id,
            title_multiloc: idea.title_multiloc,
            url: Frontend::UrlService.new.model_to_url(idea),
            published_at: (idea.published_at&.iso8601 || Time.now.iso8601),
            assigned_at: (idea.assigned_at&.iso8601 || Time.now.iso8601),
            author_name: name_service.display_name!(idea.author),
            upvotes_count: idea.upvotes_count,
            downvotes_count: idea.downvotes_count,
            comments_count: idea.comments_count,
          }},
          assigned_initiatives: initiatives.map{ |initiative| {
            id: initiative.id,
            title_multiloc: initiative.title_multiloc,
            url: Frontend::UrlService.new.model_to_url(initiative),
            published_at: (initiative.published_at&.iso8601 || Time.now.iso8601),
            assigned_at: (initiative.assigned_at&.iso8601 || Time.now.iso8601),
            author_name: name_service.display_name!(initiative.author),
            upvotes_count: initiative.upvotes_count,
            comments_count: initiative.comments_count,
            images: initiative.initiative_images.map{ |image|
              {
                ordering: image.ordering,
                versions: image.image.versions.map{|k, v| [k.to_s, v.url]}.to_h
              }
            },
            header_bg: {
              versions: initiative.header_bg.versions.map{|k, v| [k.to_s, v.url]}.to_h
            }
          }},
          succesful_assigned_initiatives: initiatives.map{ |initiative| {
            id: initiative.id,
            title_multiloc: initiative.title_multiloc,
            url: Frontend::UrlService.new.model_to_url(initiative),
            published_at: (initiative.published_at&.iso8601 || Time.now.iso8601),
            assigned_at: (initiative.assigned_at&.iso8601 || Time.now.iso8601),
            author_name: name_service.display_name!(initiative.author),
            upvotes_count: initiative.upvotes_count,
            comments_count: initiative.comments_count,
            threshold_reached_at: (initiative.threshold_reached_at&.iso8601 || Time.now.iso8601),
            images: initiative.initiative_images.map{ |image|
              {
                ordering: image.ordering,
                versions: image.image.versions.map{|k, v| [k.to_s, v.url]}.to_h
              }
            },
            header_bg: {
              versions: initiative.header_bg.versions.map{|k, v| [k.to_s, v.url]}.to_h
            }
          }},
          need_feedback_assigned_ideas_count: 5
        }
      }
    end
    let(:mail) { described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now }

    before do
      EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id)
    end

    it 'renders the subject' do
      expect(mail.subject).to start_with('Ideas requiring your feedback:')
    end

    it 'renders the receiver email' do
      expect(mail.to).to eq([recipient.email])
    end

    it 'renders the sender email' do
      expect(mail.from).to all(end_with('@citizenlab.co'))
    end

    it 'assigns idea title' do
      expect(mail.body.encoded).to match(ideas.first.title_multiloc['en'])
    end

    it 'assigns admin ideas url' do
      expect(mail.body.encoded).to match(Frontend::UrlService.new.admin_ideas_url)
    end
  end
end
