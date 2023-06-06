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
    column_name: proc { |model| "#{model.mode}votes_count" },
    column_names: {
      ['votes.mode = ?', 'up'] => 'likes_count',
      ['votes.mode = ?', 'down'] => 'dislikes_count'
    }
  )
  belongs_to :user, optional: true

  validates :reactable, :mode, presence: true
  validates :mode, inclusion: { in: MODES }
  validates :user_id, uniqueness: { scope: %i[reactable_id reactable_type mode], allow_nil: true }

  scope :up, -> { where mode: 'up' }
  scope :down, -> { where mode: 'down' }

  def up?
    mode == 'up'
  end

  def down?
    mode == 'down'
  end

  def project_id
    reactable.try(:project_id)
  end
end
