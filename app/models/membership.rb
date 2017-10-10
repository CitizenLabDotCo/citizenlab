class Membership < ApplicationRecord
  belongs_to :group
  belongs_to :user

  validates :group, :user, presence: true
end