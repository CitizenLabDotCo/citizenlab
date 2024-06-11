# frozen_string_literal: true

# == Schema Information
#
# Table name: content_builder_layout_images
#
#  id         :uuid             not null, primary key
#  image      :string
#  code       :string
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
module ContentBuilder
  class LayoutImage < ApplicationRecord
    attr_accessor :skip_image_presence

    mount_base64_uploader :image, LayoutImageUploader

    before_validation :generate_code, on: :create

    validates :image, presence: true, unless: :skip_image_presence

    def self.generate_code
      SecureRandom.uuid
    end

    # Creates a copy of the image, but with a different code.
    # @return [LayoutImage] the duplicated image.
    def duplicate
      dup.tap { |image| image.code = self.class.generate_code }
    end

    # Creates and persists a copy of the image, but with a different code.
    # @return [LayoutImage] the duplicated image.
    def duplicate!
      duplicate.tap(&:save!)
    end

    private

    def generate_code
      self.code = self.class.generate_code unless code
    end
  end
end
