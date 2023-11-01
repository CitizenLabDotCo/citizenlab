# frozen_string_literal: true

# == Schema Information
#
# Table name: analytics_dimension_user_custom_field_values
#
#  user_id :uuid
#  key     :text
#  value   :text
#
module Analytics
  class DimensionUserCustomFieldValue < Analytics::ApplicationRecordView
  end
end
