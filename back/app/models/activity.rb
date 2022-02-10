# == Schema Information
#
# Table name: activities
#
#  id         :uuid             not null, primary key
#  item_type  :string           not null
#  item_id    :uuid             not null
#  action     :string           not null
#  payload    :jsonb            not null
#  user_id    :uuid
#  acted_at   :datetime         not null
#  created_at :datetime         not null
#
# Indexes
#
#  index_activities_on_acted_at               (acted_at)
#  index_activities_on_item_type_and_item_id  (item_type,item_id)
#  index_activities_on_user_id                (user_id)
#
# Foreign Keys
#
#  fk_rails_...  (user_id => users.id)
#
class Activity < ApplicationRecord
  belongs_to :user, optional: true
  belongs_to :item, polymorphic: true, optional: true

  validates :action, :item_type, :item_id, presence: true
end
