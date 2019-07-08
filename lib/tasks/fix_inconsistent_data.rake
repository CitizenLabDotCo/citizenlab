
namespace :inconsistent_data do
  desc "Fixes for inconsistent data"
  task :fix_empty_bodies => :environment do
    fixes = {}
    failures = {}

    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        to_fix = Idea.all.select do |i| 
          i.body_multiloc.values.all? do |text_or_html|
            Nokogiri::HTML.fragment(text_or_html).text.blank?
          end
        end
        to_fix.each do |i| 
          locale, title = i.title_multiloc.first
          i.body_multiloc[locale] = title if i.body_multiloc[locale].blank?  # Just making very sure
          log = if i.save
            fixes
          else
            failures
          end
          log[tenant.host] ||= []
          log[tenant.host] += [i.slug]
        end      
      end
    end

    if fixes.present?
      puts "Fixed empty bodies for some tenants:"
      fixes.each do |host, idea_slugs|
        puts "#{host}: #{idea_slugs}"
      end
    end

    if failures.present?
      puts "Failed to fix empty bodies for some tenants:"
      failures.each do |host, idea_slugs|
        puts "#{host}: #{idea_slugs}"
      end
    else
      puts "Success!"
    end
  end

  task :fix_pc_that_cannot_contain_ideas => :environment do
    fixes = {}
    failures = {}

    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        to_fix = Project.where(process_type: 'continuous').all.select do |project| 
          !project.can_contain_ideas? && project.ideas.present?
        end
        to_fix += Phase.all.select do |phase| 
          !phase.can_contain_ideas? && phase.ideas.present?
        end
        to_fix.each do |p| 
          log = if p.update(ideas: [])
            fixes
          else
            failures
          end
          log[tenant.host] ||= []
          log[tenant.host] += ["#{p.class} #{p.id}"]
        end      
      end
    end

    if fixes.present?
      puts "Fixed for some tenants:"
      fixes.each do |host, classes_and_slugs|
        puts "#{host}: #{classes_and_slugs.join ', '}"
      end
    end

    if failures.present?
      puts "Failed for some tenants:"
      failures.each do |host, classes_and_slugs|
        puts "#{host}: #{classes_and_slugs.join ', '}"
      end
    else
      puts "Success!"
    end
  end
end
