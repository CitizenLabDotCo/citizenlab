# frozen_string_literal: true

namespace :fix_existing_tenants do
  desc 'Trim the titles of the existing ideas according to the required maximum.'
  task trim_idea_titles: [:environment] do |_t, _args|
    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        Idea.all.each do |idea|
          next if idea.title_multiloc.values.none? { |title| title.size > 80 }

          new_title_multiloc = idea.title_multiloc.transform_values do |title|
            title[0...80]
          end
          idea.update_columns(title_multiloc: new_title_multiloc)
        end
      end
    end
  end
end
