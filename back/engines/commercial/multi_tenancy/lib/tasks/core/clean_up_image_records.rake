# frozen_string_literal: true

namespace :cl2back do
  desc 'Remove image records not associated with resource or with nil value for image field'
  task clean_up_image_records: :environment do
    Tenant.all.each do |tenant|
      puts "Processing images for tenant #{tenant.name}"

      Apartment::Tenant.switch(tenant.schema_name) do
        image_codes = []
        service = ContentBuilder::LayoutService.new

        Project.all.each do |project|
          project.content_builder_layouts.each do |layout|
            image_codes += service.images(layout).pluck(:code)
          end
        end

        ContentBuilder::LayoutImage.all.each do |image|
          if image_codes.exclude?(image.code) || image.image.blank?
            image.destroy!
            # Add logging here + LogActivityJob? (maybe log a summary?)
          end
        end
      end
    end
  end
end
