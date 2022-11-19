# frozen_string_literal: true

# == Schema Information
#
# Table name: analytics_dimension_referrer_types
#
#  id   :uuid             not null, primary key
#  key  :string           not null
#  name :string           not null
#
# Indexes
#
#  i_d_referrer_key  (key) UNIQUE
#
module Analytics
  class DimensionReferrerType < Analytics::ApplicationRecord
    validates :key, presence: true, uniqueness: true
    validates :name, presence: true
  end
end
