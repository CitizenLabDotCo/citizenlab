# frozen_string_literal: true

# == Schema Information
#
# Table name: analytics_dimension_users
#
#  id            :uuid             primary key
#  role          :text
#  invite_status :string
#  is_visitor    :boolean
#
module Analytics
  class DimensionUser < Analytics::ApplicationRecordView
    self.primary_key = :id
  end
end
