# == Schema Information
#
# Table name: impact_tracking_pageviews
#
#  id         :uuid             not null, primary key
#  session_id :uuid             not null
#  path       :string           not null
#  route      :string           not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Foreign Keys
#
#  fk_rails_...  (session_id => impact_tracking_sessions.id)
#
class ImpactTracking::Pageview < ApplicationRecord
  validates :session_id, presence: true
  validates :path, presence: true
  validates :route, presence: true
end
