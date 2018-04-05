
namespace :fix_existing_tenants do
  desc "Trim the titles of the existing ideas according to the required maximum."
  task :trim_idea_titles => [:environment] do |t, args|
    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        Idea.all.each do |idea|
          if !idea.title_multiloc.values.select{|title| title.size > 80}.empty?
            new_title_multiloc = idea.title_multiloc.map do |locale, title|
              [locale, title[0...80]]
            end.to_h
            idea.update_columns(title_multiloc: new_title_multiloc)
          end
        end

      end
    end
  end
end