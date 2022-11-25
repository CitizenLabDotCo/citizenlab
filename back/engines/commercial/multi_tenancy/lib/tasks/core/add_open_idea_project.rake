# frozen_string_literal: true

namespace :fix_existing_tenants do
  desc 'Add the open idea project to all existing tenants and assign all ideas that do not have project to the open idea project.'
  task add_open_idea_project: [:environment] do |_t, _args|
    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.host.tr('.', '_')) do
        puts "Processing tenant #{tenant.host}..."

        open_idea_project = Project.create({
          title_multiloc: tenant.settings.dig('core', 'locales').to_h do |locale|
                            translation = I18n.with_locale(locale) { I18n.t!('projects.open_idea_project_title') }
                            [locale, translation]
                          end,
          description_multiloc: tenant.settings.dig('core', 'locales').to_h do |locale|
                                  translation = I18n.with_locale(locale) do
                                    I18n.t!('projects.open_idea_project_description')
                                  end
                                  [locale, translation]
                                end,
          internal_role: 'open_idea_box',
          presentation_mode: 'card',
          process_type: 'continuous',
          participation_method: 'ideation',
          remote_header_bg_url: 'https://cl2-seed-and-template-assets.s3.eu-central-1.amazonaws.com/images/people_with_speech_bubbles.jpeg',
          posting_enabled: true,
          commenting_enabled: true,
          upvoting_enabled: true,
          upvoting_method: 'unlimited'
        })
        ProjectImage.create({ project: open_idea_project,
remote_image_url: 'https://cl2-seed-and-template-assets.s3.eu-central-1.amazonaws.com/images/people_with_speech_bubbles.jpeg' })
        puts 'Open Idea Project created.'

        count = 0
        Idea.all.each do |idea|
          next if idea.project

          idea.project = open_idea_project
          idea.save!
          count += 1
        end
        puts "#{count} ideas were assigned to the Open Idea Project."
      end
    end
  end
end
