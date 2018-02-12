class Invite < ApplicationRecord
  belongs_to :inviter, class_name: 'User'
  belongs_to :group

  validates :token, presence: true, uniqueness: true
  validates :email, presence: true
  validates :inviter, presence: true
  validates :group, presence: true

  before_validation :generate_token, on: :create


  private

  def generate_token
    self.token ||= SecureRandom.base64
  end

end
