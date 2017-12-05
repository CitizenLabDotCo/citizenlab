class Identity < ApplicationRecord
  belongs_to :user

  validates :uid, :provider, presence: true

  def self.find_with_omniauth(auth)
    find_by(uid: auth['uid'], provider: auth['provider'])
  end

  def self.create_with_omniauth(auth)
    create(uid: auth['uid'], provider: auth['provider'], auth_hash: auth)
  end
end
