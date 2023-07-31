# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::AssigneeDigestMailer do
  describe 'AssigneeDigest' do
    let_it_be(:recipient) { create(:admin, locale: 'en') }
    let_it_be(:campaign) { EmailCampaigns::Campaigns::AssigneeDigest.create! }
    let_it_be(:assigned_at) { Time.now }
    let_it_be(:ideas) { create_list(:idea, 3, assignee: create(:admin), assigned_at: assigned_at) }
    let_it_be(:command) do
      name_service = UserDisplayNameService.new(AppConfiguration.instance, recipient)
      initiatives = create_list(:initiative, 3, assignee: create(:admin), assigned_at: assigned_at)

      {
        recipient: recipient,
        event_payload: {
          assigned_ideas: ideas.map do |idea|
                            {
                              id: idea.id,
                              title_multiloc: idea.title_multiloc,
                              url: Frontend::UrlService.new.model_to_url(idea),
                              published_at: (idea.published_at&.iso8601 || Time.now.iso8601),
                              assigned_at: (idea.assigned_at&.iso8601 || Time.now.iso8601),
                              author_name: name_service.display_name!(idea.author),
                              likes_count: idea.likes_count,
                              dislikes_count: idea.dislikes_count,
                              comments_count: idea.comments_count
                            }
                          end,
          assigned_initiatives: initiatives.map do |initiative|
                                  {
                                    id: initiative.id,
                                    title_multiloc: initiative.title_multiloc,
                                    url: Frontend::UrlService.new.model_to_url(initiative),
                                    published_at: (initiative.published_at&.iso8601 || Time.now.iso8601),
                                    assigned_at: (initiative.assigned_at&.iso8601 || Time.now.iso8601),
                                    author_name: name_service.display_name!(initiative.author),
                                    likes_count: initiative.likes_count,
                                    comments_count: initiative.comments_count,
                                    images: initiative.initiative_images.map do |image|
                                              {
                                                ordering: image.ordering,
                                                versions: image.image.versions.to_h { |k, v| [k.to_s, v.url] }
                                              }
                                            end,
                                    header_bg: {
                                      versions: initiative.header_bg.versions.to_h { |k, v| [k.to_s, v.url] }
                                    }
                                  }
                                end,
          succesful_assigned_initiatives: initiatives.map do |initiative|
                                            {
                                              id: initiative.id,
                                              title_multiloc: initiative.title_multiloc,
                                              url: Frontend::UrlService.new.model_to_url(initiative),
                                              published_at: (initiative.published_at&.iso8601 || Time.now.iso8601),
                                              assigned_at: (initiative.assigned_at&.iso8601 || Time.now.iso8601),
                                              author_name: name_service.display_name!(initiative.author),
                                              likes_count: initiative.likes_count,
                                              comments_count: initiative.comments_count,
                                              threshold_reached_at: (initiative.threshold_reached_at&.iso8601 || Time.now.iso8601),
                                              images: initiative.initiative_images.map do |image|
                                                        {
                                                          ordering: image.ordering,
                                                          versions: image.image.versions.to_h { |k, v| [k.to_s, v.url] }
                                                        }
                                                      end,
                                              header_bg: {
                                                versions: initiative.header_bg.versions.to_h { |k, v| [k.to_s, v.url] }
                                              }
                                            }
                                          end,
          need_feedback_assigned_ideas_count: 5
        }
      }
    end

    let_it_be(:mail) { described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now }

    before_all { EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id) }

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
