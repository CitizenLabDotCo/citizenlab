class Membership < ApplicationRecord
  belongs_to :group
  counter_culture :group
  belongs_to :user

  validates :group, :user, presence: true
end