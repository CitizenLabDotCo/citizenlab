# frozen_string_literal: true

module Volunteering
  class CauseImageUploader < BaseImageUploader
    version :medium do
      process resize_to_fill: [298, 135]
      process :compress
    end
  end
end
