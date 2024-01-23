# frozen_string_literal: true

# == Schema Information
#
# Table name: custom_field_option_images
#
#  id                     :uuid             not null, primary key
#  custom_field_option_id :uuid
#  image                  :string
#  ordering               :integer          default(0)
#  created_at             :datetime         not null
#  updated_at             :datetime         not null
#
# Indexes
#
#  index_custom_field_option_images_on_custom_field_option_id  (custom_field_option_id)
#
# Foreign Keys
#
#  fk_rails_...  (custom_field_option_id => custom_field_options.id)
#
class CustomFieldOptionImage < ApplicationRecord
  mount_base64_uploader :image, CustomFieldOptionImageUploader
  belongs_to :custom_field_option

  validates :custom_field_option, presence: true
end
