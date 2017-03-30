class User < ApplicationRecord
  has_secure_password
  mount_uploader :avatar, AvatarUploader

  has_many :ideas, foreign_key: :author_id

  validates :email, :slug, uniqueness: true
  validates :email, format: { with: /\A([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})\z/i }
  validates :first_name, :last_name, :slug, :email, presence: true

  before_validation :generate_slug

  def avatar_blank?
    avatar.file.nil?
  end

  def display_name
    [first_name, last_name].join(" ")
  end
  
  private

  def generate_slug
    self.slug ||= [self.first_name.parameterize, self.last_name.parameterize].join('-')
  end

end
