namespace :carrierwave do
  desc "Recreate images when versions have changed"
  task :recreate_versions, [:models,:attributes] => [:environment] do |t, args|
    models = args[:models]&.split
    attributes = args[:attributes]&.split
    MODELS = {
      IdeaImage => ['image'],
      User => ['avatar'],
      ProjectImage => ['image'],
      Tenant => ['logo', 'header_bg'],
      Project => ['header_bg']
    }

    each_tenant do |tenant|
      begin
        puts("Enqueueing #{tenant} RecreateVersionsJobs")
        Apartment::Tenant.switch(tenant) do
          MODELS.each do |claz, attrs|
            attrs = attrs.select{|attribute| attributes.include? attribute} if attributes
            if !models || models.include?(claz.name)
              claz.all.each do |instance|
                attrs.each do |attribute|
                  RecreateVersionsJob.perform_later(instance, attribute)
                end
              end
            end
          end
        end
      rescue Apartment::TenantNotFound => e
        puts e.message
      end
    end
  end

  def each_tenant(&block)
    tenants.each do |tenant|
      block.call(tenant)
    end
  end

  def tenants
    ENV['DB'] ? ENV['DB'].split(',').map { |s| s.strip } : Apartment.tenant_names || []
  end

end
