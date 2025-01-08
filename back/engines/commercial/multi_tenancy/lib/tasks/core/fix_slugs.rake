# frozen_string_literal: true

namespace :fix_existing_tenants do
  desc 'Fix the slugs for all existing tenants.'
  task fix_slugs: [:environment] do |_t, _args|
    sluggable_classes = [Group, Idea, Project, ProjectFolders::Folder, StaticPage, User]

    errors = {}
    changed = []
    Tenant.creation_finalized.each do |tenant|
      tenant.switch do
        puts "Processing tenant #{tenant.host}..."

        sluggable_classes.each do |claz|
          claz.all.each do |sluggable|
            previous_slug = sluggable.slug
            if !sluggable.valid?
              sluggable.slug = nil
              sluggable.generate_slug
              if sluggable.save
                changed += ["Changed #{tenant.host} #{claz.name} #{sluggable.id}: \"#{previous_slug}\" => \"#{sluggable.slug}\""] if previous_slug != sluggable.slug
              else
                errors[tenant.host] ||= {}
                errors[tenant.host][claz.name] ||= {}
                errors[tenant.host][claz.name][sluggable.id] = sluggable.errors.details
              end
            end
          end
        end
      end
    end

    changed.each { |change| puts change }
    if errors.present?
      puts "Some errors occurred: #{errors}"
    else
      puts 'Success!'
    end
  end
end
