module Imageable
  extend ActiveSupport::Concern

  class_methods do
    # rubocop:disable Naming/PredicateName
    def has_many_text_images_from(attribute, association_name = :text_images)
      TextImageService
        .configure_image_extraction(self, attribute, association_name)
    end

    def has_many_layout_images_from(attribute, association_name = :layout_images)
      ContentBuilder::LayoutImageService
        .configure_image_extraction(self, attribute, association_name)
    end
    # rubocop:enable Naming/PredicateName
  end
end
