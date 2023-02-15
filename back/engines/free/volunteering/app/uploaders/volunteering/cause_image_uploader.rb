# frozen_string_literal: true

module Volunteering
  class CauseImageUploader < BaseImageUploader
    version :medium do
      process resize_to_fill: [298, 135]
    end
  end
end
