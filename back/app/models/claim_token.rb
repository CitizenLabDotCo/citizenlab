# frozen_string_literal: true

# == Schema Information
#
# Table name: claim_tokens
#
#  id                 :uuid             not null, primary key
#  token              :string           not null
#  item_type          :string           not null
#  item_id            :uuid             not null
#  expires_at         :datetime         not null
#  pending_claimer_id :uuid
#  created_at         :datetime         not null
#  updated_at         :datetime         not null
#
# Indexes
#
#  index_claim_tokens_on_expires_at             (expires_at)
#  index_claim_tokens_on_item_type_and_item_id  (item_type,item_id) UNIQUE
#  index_claim_tokens_on_pending_claimer_id     (pending_claimer_id)
#  index_claim_tokens_on_token                  (token) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (pending_claimer_id => users.id)
#
class ClaimToken < ApplicationRecord
  TOKEN_EXPIRY_HOURS = 24

  attribute :token, :string, default: -> { SecureRandom.uuid }
  attribute :expires_at, :datetime, default: -> { TOKEN_EXPIRY_HOURS.hours.from_now }

  belongs_to :item, polymorphic: true, inverse_of: :claim_token
  belongs_to :pending_claimer, class_name: 'User', optional: true, inverse_of: :claim_tokens

  validates :token, presence: true, uniqueness: true
  validates :item_type, presence: true, inclusion: { in: %w[Idea] }
  validates :item_id, presence: true
  validates :expires_at, presence: true

  scope :expired, -> { where(expires_at: ...Time.current) }
  scope :not_expired, -> { where(expires_at: Time.current..) }

  def expired?
    expires_at < Time.current
  end
end
