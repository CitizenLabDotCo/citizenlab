# frozen_string_literal: true

class InitiativeImageUploader < BaseImageUploader
  version :small do
    process resize_to_fill: [96, 96]
    # process optimize: [{ quality: 90, quiet: true }]
  end

  version :medium do
    process resize_to_fill: [298, 135]
    # process optimize: [{ quality: 90, quiet: true }]
  end

  version :large do
    process resize_to_limit: [480, nil]
    # process optimize: [{ quality: 90, quiet: true }]
  end

  version :fb do
    process resize_to_fill: [1200, 630]
  end
end
