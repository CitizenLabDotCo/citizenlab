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
  # Neutral mode is only valid for ideas. Also, currently, it only makes sense the context
  # of "Common Ground" participation. However, we don't make it a hard constraint, since
  # the participation method can be changed and this could result to invalid reactions.
  MODES = %w[up down neutral].freeze

  belongs_to :reactable, polymorphic: true
  counter_culture(
    :reactable,
    column_name: proc do |model|
      case model.mode
      when 'up' then 'likes_count'
      when 'down' then 'dislikes_count'
      when 'neutral' then 'neutral_reactions_count'
      else raise "Unknown mode: #{model.mode}"
      end
    end,
    column_names: {
      ['reactions.mode = ?', 'up'] => 'likes_count',
      ['reactions.mode = ?', 'down'] => 'dislikes_count',
      ['reactions.mode = ?', 'neutral'] => 'neutral_reactions_count'
    }
  )
  belongs_to :user, optional: true

  validates :reactable, :mode, presence: true
  validates :mode, inclusion: { in: MODES }
  validate :neutral_mode_must_be_valid, if: -> { mode == 'neutral' }
  validates :user_id, uniqueness: { scope: %i[reactable_id reactable_type mode], allow_nil: true }

  scope :up, -> { where mode: 'up' }
  scope :down, -> { where mode: 'down' }
  scope :neutral, -> { where mode: 'neutral' }

  def up?
    mode == 'up'
  end

  def down?
    mode == 'down'
  end

  def neutral?
    mode == 'neutral'
  end

  def project_id
    reactable.try(:project_id)
  end

  private

  def neutral_mode_must_be_valid
    return unless mode == 'neutral'

    errors.add(:mode, 'neutral mode is only valid for ideas') if reactable_type != 'Idea'
  end
end
