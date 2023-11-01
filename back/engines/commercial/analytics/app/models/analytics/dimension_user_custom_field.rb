# frozen_string_literal: true

# == Schema Information
#
# Table name: analytics_dimension_user_custom_fields
#
#  user_id :uuid
#  key     :text
#  value   :text
#
module Analytics
  class DimensionUserCustomField < Analytics::ApplicationRecordView
  end
end
