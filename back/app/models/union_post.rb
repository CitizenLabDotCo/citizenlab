class UnionPost < ActiveRecord::Base
  self.primary_key = 'id'

  has_many :comments


  # this isn't strictly necessary, but it will prevent
  # rails from calling save, which would fail anyway.
  def readonly?
    true
  end
end