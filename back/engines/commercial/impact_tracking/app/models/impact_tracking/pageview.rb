class ImpactTracking::Pageview < ApplicationRecord
  validates :session_id, presence: true
  validates :path, presence: true
  validates :route, presence: true
end
