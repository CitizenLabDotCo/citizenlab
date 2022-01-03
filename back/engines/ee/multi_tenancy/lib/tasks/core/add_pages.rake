namespace :cl2back do
  desc 'Adds the FAQ page to all platforms'
  task :add_faq_page => :environment do
    multiloc_service = MultilocService.new

    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        puts "Adding FAQ page for tenant #{tenant.name}"
        StaticPage.create!(
          slug: 'faq',
          title_multiloc: multiloc_service.i18n_to_multiloc('static_pages.faq_title', locales: CL2_SUPPORTED_LOCALES),
          body_multiloc: multiloc_service.i18n_to_multiloc('static_pages.faq_body', locales: CL2_SUPPORTED_LOCALES),
        )
      end
    end
  end
end
