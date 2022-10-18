# frozen_string_literal: true

# == Schema Information
#
# Table name: analytics_dimension_users
#
#  id   :uuid             primary key
#  role :text
#
module Analytics
  class DimensionUser < Analytics::ApplicationRecordView
    self.primary_key = :id
  end
end
