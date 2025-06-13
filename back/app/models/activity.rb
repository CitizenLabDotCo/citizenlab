# frozen_string_literal: true

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
#  project_id :uuid
#
# Indexes
#
#  index_activities_on_acted_at               (acted_at)
#  index_activities_on_action                 (action)
#  index_activities_on_item_type_and_item_id  (item_type,item_id)
#  index_activities_on_project_id             (project_id)
#  index_activities_on_user_id                (user_id)
#
# Foreign Keys
#
#  fk_rails_...  (user_id => users.id)
#
class Activity < ApplicationRecord
  MANAGEMENT_FILTERS = [
    { item_type: 'Idea', actions: %w[created changed deleted] },
    { item_type: 'Phase', actions: %w[created changed deleted] },
    { item_type: 'Project', actions: %w[created changed deleted project_review_requested project_review_approved] },
    { item_type: 'ProjectFolders::Folder', actions: %w[created changed deleted] }
  ].freeze

  belongs_to :user, optional: true
  belongs_to :item, polymorphic: true, optional: true

  validates :action, :item_type, :item_id, presence: true

  scope :management, lambda {
    activities = where('acted_at > ?', 30.days.ago).where(user: User.admin_or_moderator)

    result = Activity.none

    MANAGEMENT_FILTERS.each do |filter|
      result = result.or(activities.where(
        item_type: filter[:item_type],
        action: filter[:actions]
      ))
    end

    result
  }

  # In case the item is an object that is using STI,
  # we want to store the base class name in item_type.
  # See https://api.rubyonrails.org/classes/ActiveRecord/Associations/ClassMethods.html#label-Polymorphic+Associations and search for "(STI)"
  def item_type=(class_name)
    super(class_name.constantize.base_class.to_s)
  end
end
