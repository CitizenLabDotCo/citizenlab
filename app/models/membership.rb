class Membership < ApplicationRecord
  belongs_to :group
  counter_culture :group, 
    column_name: proc {|membership| membership&.user&.active? ? "memberships_count" : nil},
    touch: true
  belongs_to :user

  validates :group, :user, presence: true
  validates :user, uniqueness: { scope: :group }
  validate :validate_belongs_to_manual_group


  def validate_belongs_to_manual_group
    if group.present? && !group.manual?
      errors.add(:group, :is_not_a_manual_group, message: 'is not a manual group')
    end
  end
end