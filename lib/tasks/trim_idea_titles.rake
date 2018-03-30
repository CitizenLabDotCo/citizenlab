
namespace :fix_existing_tenants do
  desc "Trim the titles of the existing ideas according to the required maximum."
  task :trim_idea_titles => [:environment] do |t, args|
    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.host.gsub('.', '_')) do
        Idea.all.each do |idea|
          if !idea.title_multiloc.values.select{|title| title.size > Idea::MAX_TITLE_LEN}.empty?
            idea.title_multiloc = idea.title_multiloc.map do |locale, title|
              [locale, title[0..Idea::MAX_TITLE_LEN-1]]
            end.to_h
            idea.save!
          end
        end

      end
    end
  end
end