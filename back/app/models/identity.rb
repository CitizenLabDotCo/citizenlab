# frozen_string_literal: true

# == Schema Information
#
# Table name: identities
#
#  id         :uuid             not null, primary key
#  provider   :string
#  uid        :string
#  auth_hash  :jsonb
#  user_id    :uuid
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_identities_on_user_id  (user_id)
#
# Foreign Keys
#
#  fk_rails_...  (user_id => users.id)
#
class Identity < ApplicationRecord
  belongs_to :user

  validates :uid, :provider, presence: true

  def self.find_with_omniauth(auth)
    find_by(uid: auth['uid'], provider: auth['provider'])
  end

  def self.build_with_omniauth(auth)
    new(uid: auth['uid'], provider: auth['provider'], auth_hash: auth)
  end

  def self.find_or_build_with_omniauth(auth, authver_method)
    auth_to_persist = if authver_method.respond_to?(:filter_auth_to_persist)
      authver_method.filter_auth_to_persist(auth)
    else
      auth
    end

    find_with_omniauth(auth) || build_with_omniauth(auth_to_persist)
  end

  def email_always_present?
    AuthenticationService.all_methods.fetch(provider).email_always_present?
  end
end
