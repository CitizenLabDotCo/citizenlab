# frozen_string_literal: true

# == Schema Information
#
# Table name: analytics_dimension_referrer_types
#
#  id   :uuid             not null, primary key
#  key  :string
#  name :string
#
# Indexes
#
#  i_d_referrer_key  (key) UNIQUE
#
module Analytics
  class DimensionReferrerType < Analytics::ApplicationRecord
  end
end
