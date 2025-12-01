# frozen_string_literal: true

# == Schema Information
#
# Table name: email_bans
#
#  id                    :uuid             not null, primary key
#  email_hash            :string           not null
#  normalized_email_hash :string           not null
#  reason                :text
#  banned_by_id          :uuid
#  created_at            :datetime         not null
#
# Indexes
#
#  index_email_bans_on_banned_by_id           (banned_by_id)
#  index_email_bans_on_email_hash             (email_hash)
#  index_email_bans_on_normalized_email_hash  (normalized_email_hash)
#
# Foreign Keys
#
#  fk_rails_...  (banned_by_id => users.id)
#
class EmailBan < ApplicationRecord
  belongs_to :banned_by, class_name: 'User', optional: true

  validates :email_hash, presence: true
  validates :normalized_email_hash, presence: true

  class << self
    def banned?(email)
      canonical = EmailNormalizationService.canonicalize(email)
      normalized = EmailNormalizationService.normalize(email)

      exists?(normalized_email_hash: sha256(normalized)) ||
        exists?(email_hash: sha256(canonical))
    end

    def ban!(email, reason: nil, banned_by: nil)
      canonical = EmailNormalizationService.canonicalize(email)
      normalized = EmailNormalizationService.normalize(email)

      create!(
        email_hash: sha256(canonical),
        normalized_email_hash: sha256(normalized),
        reason: reason,
        banned_by: banned_by
      )
    end

    def find_for(email)
      canonical = EmailNormalizationService.canonicalize(email)
      normalized = EmailNormalizationService.normalize(email)

      find_by(normalized_email_hash: sha256(normalized)) ||
        find_by(email_hash: sha256(canonical))
    end

    private

    def sha256(string)
      Digest::SHA256.hexdigest(string)
    end
  end
end
