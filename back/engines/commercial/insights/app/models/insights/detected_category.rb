# frozen_string_literal: true

# == Schema Information
#
# Table name: insights_detected_categories
#
#  id         :uuid             not null, primary key
#  name       :string           not null
#  view_id    :uuid             not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_insights_detected_categories_on_view_id           (view_id)
#  index_insights_detected_categories_on_view_id_and_name  (view_id,name) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (view_id => insights_views.id)
#
module Insights
  class DetectedCategory < ::ApplicationRecord
    belongs_to :view

    validates :name, presence: true, uniqueness: { scope: :view }
    validates :view, presence: true
  end
end
