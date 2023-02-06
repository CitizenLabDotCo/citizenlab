# frozen_string_literal: true

namespace :cl2back do
  desc 'Remove dangling images'
  task remove_dangling_images: :environment do
    Tenant.all.each do |tenant|
      image_codes = []
      service = ContentBuilder::LayoutService.new

      puts "Removing dangling images for tenant #{tenant.name}"

      Apartment::Tenant.switch(tenant.schema_name) do
        Project.all.each do |project|
          project.content_builder_layouts.each do |layout|
            image_codes += service.images(layout).pluck(:code)
          end
        end

        Rails.logger.info(
          "\n-------------------------\n" \
          "#{image_codes.inspect}\n" \
          '-------------------------'
        )

        ContentBuilder::LayoutImage.all.each do |image|
          if image_codes.exclude?(image.code)
            # image.remove_image!
            image.destroy!
          end
        end
      end
    end
  end
end
