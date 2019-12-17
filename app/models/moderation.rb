class Moderation < ActiveRecord::Base
  self.primary_key = 'id'

  has_one :moderation_status, as: :moderatable

  # this isn't strictly necessary, but it will prevent
  # rails from calling save, which would fail anyway.
  def readonly?
    true
  end
end