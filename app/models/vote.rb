class Vote < ApplicationRecord
  MODES = %w(up down)

  belongs_to :votable, polymorphic: true
  belongs_to :user

  enum mode: MODES

  validates :mode, inclusion: { in: MODES }
end
