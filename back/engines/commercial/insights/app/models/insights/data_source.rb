# == Schema Information
#
# Table name: insights_data_sources
#
#  id          :uuid             not null, primary key
#  view_id     :uuid             not null
#  origin_type :string           not null
#  origin_id   :uuid             not null
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#
# Indexes
#
#  index_insights_data_sources_on_origin           (origin_type,origin_id)
#  index_insights_data_sources_on_view_and_origin  (view_id,origin_type,origin_id) UNIQUE
#  index_insights_data_sources_on_view_id          (view_id)
#
# Foreign Keys
#
#  fk_rails_...  (view_id => insights_views.id)
#
module Insights
  class DataSource < ::ApplicationRecord
    ORIGIN_TYPES = [Project].map(&:name).freeze

    belongs_to :origin, polymorphic: true
    belongs_to :view, class_name: 'Insights::View'
    # We use an explicit +before_destroy+ callback because
    #   dependent: :destroy
    # (which is equivalent to an :after_destroy callback) makes the deletion of 
    # views or data sources fail with:
    #   ActiveRecord::RecordNotDestroyed: 
    #   Failed to destroy the record
    # I don't have a clear explanation why this happens.
    before_destroy { view.destroy }

    validates :view, :origin, presence: true
    validates :origin_type, inclusion: { in: ORIGIN_TYPES }
  end
end
