class User < ApplicationRecord
  has_secure_password
  mount_uploader :avatar, AvatarUploader

  validates :email, :slug, uniqueness: true
  validates :email, format: { with: /\A([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})\z/i }
  validates :name, :slug, :email, presence: true

  before_validation :generate_slug

  def avatar_blank?
    avatar.file.nil?
  end

  private

  def generate_slug
    self.slug ||= self.name.parameterize
  end
end
