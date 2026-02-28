# frozen_string_literal: true

# == Schema Information
#
# Table name: text_images
#
#  id              :uuid             not null, primary key
#  imageable_type  :string           not null
#  imageable_id    :uuid             not null
#  imageable_field :string
#  image           :string
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#  text_reference  :string           not null
#  deleted_at      :datetime
#
# Indexes
#
#  index_text_images_on_deleted_at  (deleted_at)
#
class TextImage < ApplicationRecord
  acts_as_paranoid
  attribute :text_reference, :string, default: -> { SecureRandom.uuid }

  mount_base64_uploader :image, TextImageUploader
  belongs_to :imageable, polymorphic: true

  validates :imageable, presence: true
end
