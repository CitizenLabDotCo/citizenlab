
namespace :fix_existing_tenants do
  desc "Add the open idea project to all existing tenants and assign all ideas that do not have project to the open idea project."
  task :add_open_idea_project => [:environment] do |t, args|
    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.host.gsub('.', '_')) do
        puts "Processing tenant #{tenant.host}..."
        
        open_idea_project = Project.create ({
          title_multiloc: tenant.settings.dig('core', 'locales').map do |locale|
              translation = I18n.with_locale(locale) { I18n.t!('projects.open_idea_project_title') }
              [locale, translation]
            end.to_h,
          description_multiloc: tenant.settings.dig('core', 'locales').map do |locale|
              translation = I18n.with_locale(locale) { I18n.t!('projects.open_idea_project_description') }
              [locale, translation]
            end.to_h,
          internal_role: 'open_idea_box',
          presentation_mode: 'card',
          process_type: 'continuous',
          participation_method: 'ideation',
          remote_header_bg_url: 'http://res.cloudinary.com/citizenlabco/image/upload/v1516809200/Idea_cover_qdrwa6.jpg',
          posting_enabled: true,
          commenting_enabled: true,
          voting_enabled: true,
          voting_method: 'unlimited'
        })
        ProjectImage.create({project: open_idea_project, remote_image_url: 'http://res.cloudinary.com/citizenlabco/image/upload/v1516925813/open_idea_box_gaxtpy.png'})
        puts "Open Idea Project created."
 
        count = 0
        Idea.all.each do |idea|
          if !idea.project
            idea.project = open_idea_project
            idea.save!
            count += 1
          end
        end
        puts "#{count} ideas were assigned to the Open Idea Project."

      end
    end
  end
end