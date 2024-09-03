# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::IdeaPublishedMailer do
  describe 'campaign_mail' do
    before_all do
      config = AppConfiguration.instance
      config.settings['core']['organization_name'] = { 'en' => 'Vaudeville' }
      config.save!
    end

    let_it_be(:recipient) { create(:user, locale: 'en') }
    let_it_be(:campaign) { EmailCampaigns::Campaigns::IdeaPublished.create! }
    let_it_be(:input) { create(:idea, author: recipient) }
    let_it_be(:command) do
      activity = create(:activity, item: input, action: 'published')
      create(:idea_published_campaign).generate_commands(
        activity: activity,
        recipient: recipient
      ).first.merge({ recipient: recipient })
    end
    let_it_be(:mail) { described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now }

    it 'renders the subject' do
      expect(mail.subject).to eq('Your input on the platform of Vaudeville')
    end

    it 'renders the receiver email' do
      expect(mail.to).to eq([recipient.email])
    end

    it 'renders the sender email' do
      expect(mail.from).to all(end_with('@citizenlab.co'))
    end

    it 'includes the header' do
      expect(mail.body.encoded).to have_tag('div') do
        with_tag 'h1' do
          with_text(/You posted an input! Let's make sure it gets read\./)
        end
      end
    end

    it 'includes the input box' do
      expect(mail.body.encoded).to have_tag('table') do
        with_tag 'p' do
          with_text(/Reach more people with your input:/)
        end
        with_tag 'table' do
          with_tag('tr') do
            with_tag('td') do
              with_tag('img', with: { alt: 'Checked checkmark', src: 'https://cl2-seed-and-template-assets.s3.eu-central-1.amazonaws.com/images/icons/icon_checked_checkbox.png' })
            end
            with_tag('td') do
              with_tag('span', with: { style: 'text-decoration: line-through;' }) do
                with_text(/Published input/)
              end
            end
          end
          with_tag('tr') do
            with_tag('td') do
              with_tag('img', with: { alt: 'Empty checkmark', src: 'https://cl2-seed-and-template-assets.s3.eu-central-1.amazonaws.com/images/icons/icon_unchecked_checkbox.png' })
            end
            with_tag('td') do
              with_text(/Add an image to increase visibility/)
              with_tag('a', with: { href: "http://example.org/en/ideas/#{input.slug}" })
            end
            with_tag('td') do
              with_tag('img', with: { alt: 'Image icon', src: 'https://cl2-seed-and-template-assets.s3.eu-central-1.amazonaws.com/images/icons/icon_image.png' })
            end
          end
          with_tag('tr') do
            with_tag('td') do
              with_tag('img', with: { alt: 'Empty checkmark', src: 'https://cl2-seed-and-template-assets.s3.eu-central-1.amazonaws.com/images/icons/icon_unchecked_checkbox.png' })
            end
            with_tag('td') do
              with_text(/Let your friends know on/)
              with_tag('a', with: { href: "https://www.facebook.com/sharer/sharer.php?u=http%3A%2F%2Fexample.org%2Fen%2Fideas%2F#{input.slug}", style: 'text-decoration: underline;' }) do
                with_text(/Facebook/)
              end
            end
            with_tag('td') do
              with_tag('img', with: { alt: 'Facebook icon', src: 'https://cl2-seed-and-template-assets.s3.eu-central-1.amazonaws.com/images/icons/icon_facebook_logo.png' })
            end
          end
          with_tag('tr') do
            with_tag('td') do
              with_tag('img', with: { alt: 'Empty checkmark', src: 'https://cl2-seed-and-template-assets.s3.eu-central-1.amazonaws.com/images/icons/icon_unchecked_checkbox.png' })
            end
            with_tag('td') do
              with_text(/Inform your followers on/)
              with_tag('a', with: { href: "https://twitter.com/intent/tweet?text=http%3A%2F%2Fexample.org%2Fen%2Fideas%2F#{input.slug}", style: 'text-decoration: underline;' }) do
                with_text(/Twitter/)
              end
            end
            with_tag('td') do
              with_tag('img', with: { alt: 'Twitter icon', src: 'https://cl2-seed-and-template-assets.s3.eu-central-1.amazonaws.com/images/icons/icon_twitter_logo_small.png' })
            end
          end
          with_tag('tr') do
            with_tag('td') do
              with_tag('img', with: { alt: 'Empty checkmark', src: 'https://cl2-seed-and-template-assets.s3.eu-central-1.amazonaws.com/images/icons/icon_unchecked_checkbox.png' })
            end
            with_tag('td') do
              with_text(/Send your contacts an/)
              with_tag('a', with: { href: 'mailto:?subject=' }) do
                with_text(/email/)
              end
            end
            with_tag('td') do
              with_tag('img', with: { alt: 'Paper plane', src: 'https://cl2-seed-and-template-assets.s3.eu-central-1.amazonaws.com/images/icons/icon_sent.png' })
            end
          end
          with_tag('tr') do
            with_tag('td') do
              with_tag('img', with: { alt: 'Empty checkmark', src: 'https://cl2-seed-and-template-assets.s3.eu-central-1.amazonaws.com/images/icons/icon_unchecked_checkbox.png' })
            end
            with_tag('td') do
              with_text(/Share it via any channel by copying the/)
              with_tag('a', with: { href: "http://example.org/en/ideas/#{input.slug}", style: 'text-decoration: underline;' }) do
                with_text(/link/)
              end
            end
            with_tag('td') do
              with_tag('img', with: { alt: 'Copy', src: 'https://cl2-seed-and-template-assets.s3.eu-central-1.amazonaws.com/images/icons/icon_copy.png' })
            end
          end
        end
      end
    end

    it 'includes the CTA' do
      expect(mail.body.encoded).to have_tag('a', with: { href: "http://example.org/en/ideas/#{input.slug}" }) do
        with_text(/Go to your input/)
      end
    end
  end
end
