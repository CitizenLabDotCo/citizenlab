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
#  index_insights_data_sources_on_view_and_origin  (view_id,origin_type,origin_id) UNIQUE
#  index_insights_data_sources_on_view_id          (view_id)
#
# Foreign Keys
#
#  fk_rails_...  (view_id => insights_views.id)
#
module Insights
  class DataSource < ::ApplicationRecord
    belongs_to :view, class_name: 'Insights::View'
    belongs_to :origin, polymorphic: true

    validates :view, :origin_id, :origin_type, presence: true
    accepts_nested_attributes_for :origin
  end
end
