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

    validate :image_presence, unless: :skip_image_presence

    def self.generate_code
      SecureRandom.uuid
    end

    private

    def generate_code
      self.code = self.class.generate_code unless code
    end

    def image_presence
      return if image.present?

      errors.add(:image, "can't be blank")
    end
  end
end
