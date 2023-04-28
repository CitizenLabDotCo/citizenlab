# frozen_string_literal: true

# == Schema Information
#
# Table name: sso_custom_field_mappings
#
#  id                       :uuid             not null, primary key
#  key_custom_field_id      :uuid
#  key_custom_field_value   :string
#  value_custom_field_id    :uuid
#  value_custom_field_value :string
#  created_at               :datetime         not null
#  updated_at               :datetime         not null
#
# Indexes
#
#  index_sso_custom_field_mappings_on_key                    (key_custom_field_id,key_custom_field_value)
#  index_sso_custom_field_mappings_on_key_custom_field_id    (key_custom_field_id)
#  index_sso_custom_field_mappings_on_value_custom_field_id  (value_custom_field_id)
#
# Foreign Keys
#
#  fk_rails_...  (key_custom_field_id => custom_fields.id)
#  fk_rails_...  (value_custom_field_id => custom_fields.id)
#
class SsoCustomFieldMapping < ApplicationRecord
end
