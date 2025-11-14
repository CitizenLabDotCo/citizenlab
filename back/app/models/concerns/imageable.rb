module Imageable
  extend ActiveSupport::Concern

  class_methods do
    def has_many_text_images(from:, as: :text_images) # rubocop:disable Naming/PredicateName
      TextImageService.setup_image_extraction(self, from, as)
    end
  end
end
