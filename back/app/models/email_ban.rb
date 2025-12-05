# frozen_string_literal: true

# == Schema Information
#
# Table name: email_bans
#
#  id                    :uuid             not null, primary key
#  normalized_email_hash :string           not null
#  reason                :text
#  banned_by_id          :uuid
#  created_at            :datetime         not null
#
# Indexes
#
#  index_email_bans_on_banned_by_id           (banned_by_id)
#  index_email_bans_on_normalized_email_hash  (normalized_email_hash) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (banned_by_id => users.id)
#
class EmailBan < ApplicationRecord
  belongs_to :banned_by, class_name: 'User', optional: true

  validates :normalized_email_hash, presence: true, uniqueness: true

  class << self
    def banned?(email)
      normalized = EmailNormalizationService.normalize(email)
      exists?(normalized_email_hash: sha256(normalized))
    end

    def ban!(email, reason: nil, banned_by: nil)
      normalized = EmailNormalizationService.normalize(email)
      hash = sha256(normalized)

      record = find_or_initialize_by(normalized_email_hash: hash)
      record.update!(reason: reason, banned_by: banned_by)
      record
    end

    def find_for(email)
      normalized = EmailNormalizationService.normalize(email)
      find_by(normalized_email_hash: sha256(normalized))
    end

    private

    def sha256(string)
      Digest::SHA256.hexdigest(string)
    end
  end
end
