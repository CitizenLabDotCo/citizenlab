
namespace :cl2back do
  desc "Adds the homepage info page to all platforms"
  task :add_homepage_info_page => :environment do
    multiloc_service = MultilocService.new

    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        puts "Adding homepage-info page for tenant #{tenant.name}"
        Page.create!(
          slug: 'homepage-info',
          title_multiloc: multiloc_service.i18n_to_multiloc('pages.homepage_info_title'),
          body_multiloc: multiloc_service.i18n_to_multiloc('pages.homepage_info_body'),
        )
      end
    end
  end
end
