# frozen_string_literal: true

# == Schema Information
#
# Table name: reactions
#
#  id             :uuid             not null, primary key
#  reactable_id   :uuid
#  reactable_type :string
#  user_id        :uuid
#  mode           :string           not null
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#
# Indexes
#
#  index_reactions_on_reactable_type_and_reactable_id              (reactable_type,reactable_id)
#  index_reactions_on_reactable_type_and_reactable_id_and_user_id  (reactable_type,reactable_id,user_id) UNIQUE
#  index_reactions_on_user_id                                      (user_id)
#
# Foreign Keys
#
#  fk_rails_...  (user_id => users.id)
#
class Reaction < ApplicationRecord
  MODES = %w[up down]

  belongs_to :reactable, polymorphic: true
  counter_culture(
    :reactable,
    column_name: proc { |model| model.mode == 'up' ? 'likes_count' : 'dislikes_count' },
    column_names: {
      ['reactions.mode = ?', 'up'] => 'likes_count',
      ['reactions.mode = ?', 'down'] => 'dislikes_count'
    }
  )
  belongs_to :user, optional: true
  has_many :verification_reactions_verifications_hashed_uids, class_name: 'Verification::ReactionsVerificationsHashedUid', dependent: :destroy

  validates :reactable, :mode, presence: true
  validates :mode, inclusion: { in: MODES }
  validates :user_id, uniqueness: { scope: %i[reactable_id reactable_type mode], allow_nil: true }

  after_create :create_verification_reactions_verifications_hashed_uids

  scope :up, -> { where mode: 'up' }
  scope :down, -> { where mode: 'down' }

  scope :linked_to_verification_hashed_uids, (proc do |hashed_uids|
    joins(:verification_reactions_verifications_hashed_uids)
      .where(verification_reactions_verifications_hashed_uids: { verification_hashed_uid: hashed_uids })
  end)

  def up?
    mode == 'up'
  end

  def down?
    mode == 'down'
  end

  def project_id
    reactable.try(:project_id)
  end

  private

  def create_verification_reactions_verifications_hashed_uids
    return unless user&.verifications&.any?

    user.verifications_hashed_uids.each do |uid|
      verification_reactions_verifications_hashed_uids.create(verification_hashed_uid: uid)
    end
  end
end
