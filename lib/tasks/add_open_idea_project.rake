
namespace :fix_existing_tenants do
  desc "Add the open idea project to all existing tenants and assign all ideas that do not have project to the open idea project."
  task :add_open_idea_project => [:environment] do |t, args|
    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.host.gsub '.', '_') do
        open_idea_project = Project.create {
          title_multiloc: tenant.settings('core', 'locales').map do |locale|
              translation = I18n.with_locale(locale) { I18n.t!('projects.open_idea_project_title') }
              [locale, translation]
            end.to_h,
          description_multiloc: tenant.settings('core', 'locales').map do |locale|
              translation = I18n.with_locale(locale) { I18n.t!('projects.open_idea_project_description') }
              [locale, translation]
            end.to_h,
          internal_role: 'open_idea_box',
          presentation_mode: 'card',
          process_type: 'continuous',
          participation_method: 'ideation',
          posting_enabled: true,
          commenting_enabled: true,
          voting_enabled: true,
          voting_method: 'unlimited',
        }
        Idea.all.each do |idea|
          if idea.projects.empty?
            idea.projects << open_idea_project
            idea.save!
          end
      end
    end
  end

end
