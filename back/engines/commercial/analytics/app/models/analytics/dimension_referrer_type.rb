# frozen_string_literal: true

# == Schema Information
#
# Table name: analytics_dimension_referrer_types
#
#  id            :uuid             not null, primary key
#  name_multiloc :jsonb
#
module Analytics
  class DimensionReferrerType < Analytics::ApplicationRecord
  end
end
