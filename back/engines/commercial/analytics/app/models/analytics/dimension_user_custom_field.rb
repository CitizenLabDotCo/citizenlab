# frozen_string_literal: true

# == Schema Information
#
# Table name: analytics_dimension_user_custom_fields
#
#  id    :uuid             primary key
#  key   :text
#  value :text
#
module Analytics
  class DimensionUserCustomField < Analytics::ApplicationRecordView
    self.primary_key = :id
  end
end
