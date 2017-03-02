class User < ApplicationRecord
  has_secure_password

  validates :email, :slug, uniqueness: true
  validates :email, format: { with: /\A([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})\z/i }
  validates :name, :slug, :email, presence: true

  before_validation :generate_slug

  private

  def generate_slug
    self.slug ||= self.name.parameterize
  end
end
