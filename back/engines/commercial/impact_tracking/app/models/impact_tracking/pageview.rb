# == Schema Information
#
# Table name: impact_tracking_pageviews
#
#  id                          :uuid             not null, primary key
#  impact_tracking_sessions_id :uuid             not null
#  path                        :string           not null
#  route                       :string           not null
#  created_at                  :datetime         not null
#  updated_at                  :datetime         not null
#
# Foreign Keys
#
#  fk_rails_...  (impact_tracking_sessions_id => impact_tracking_sessions.id)
#
class ImpactTracking::Pageview < ApplicationRecord
  validates :impact_tracking_sessions_id, presence: true
  validates :path, presence: true
  validates :route, presence: true
end
