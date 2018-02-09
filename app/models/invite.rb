class Invite < ApplicationRecord
  belongs_to :inviter
  belongs_to :group

  validates :token, presence: true, uniqueness: true
  validates :email, presence: true
  validates :inviter, presence: true
  validates :group, presence: true

  before_validation :set_locale, :generate_token, on: :create


  private

  def set_locale
    self.locale ||= self.inviter&.locale
  end

  def generate_token
    self.token ||= SecureRandom.base64
  end

end
