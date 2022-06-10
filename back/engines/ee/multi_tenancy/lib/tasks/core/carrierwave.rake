# frozen_string_literal: true

namespace :carrierwave do
  desc 'Recreate images when versions have changed'
  task :recreate_versions, %i[models attributes] => [:environment] do |_t, args|
    models = args[:models]&.split
    attributes = args[:attributes]&.split
    models = {
      IdeaImage => ['image'],
      User => ['avatar'],
      ProjectImage => ['image'],
      Tenant => %w[logo header_bg],
      Project => ['header_bg']
    }.freeze

    each_tenant do |tenant|
      puts("Enqueueing #{tenant} RecreateVersionsJobs")
      Apartment::Tenant.switch(tenant) do
        models.each do |claz, attrs|
          attrs = attrs.select { |attribute| attributes.include? attribute } if attributes
          next unless !models || models.include?(claz.name)

          claz.all.each do |instance|
            attrs.each do |attribute|
              RecreateVersionsJob.perform_later(instance, attribute)
            end
          end
        end
      end
    rescue Apartment::TenantNotFound => e
      puts e.message
    end
  end

  def each_tenant
    tenants.each(&block)
  end

  def tenants
    ENV['DB'] ? ENV['DB'].split(',').map(&:strip) : Apartment.tenant_names || []
  end
end
