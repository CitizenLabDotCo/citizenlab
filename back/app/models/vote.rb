# == Schema Information
#
# Table name: votes
#
#  id           :uuid             not null, primary key
#  votable_id   :uuid
#  votable_type :string
#  user_id      :uuid
#  mode         :string           not null
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#
# Indexes
#
#  index_votes_on_user_id                                  (user_id)
#  index_votes_on_votable_type_and_votable_id              (votable_type,votable_id)
#  index_votes_on_votable_type_and_votable_id_and_user_id  (votable_type,votable_id,user_id) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (user_id => users.id)
#
class Vote < ApplicationRecord
  MODES = %w(up down)

  belongs_to :votable, polymorphic: true
  counter_culture :votable, 
    column_name: proc {|model| "#{model.mode}votes_count" },
    column_names: {
      ["votes.mode = ?", 'up']   => 'upvotes_count',
      ["votes.mode = ?", 'down'] => 'downvotes_count'
    }
  belongs_to :user, optional: true

  validates :votable, :mode, presence: true
  validates :mode, inclusion: { in: MODES }
  validates :user_id, uniqueness: {scope: [:votable_id, :votable_type, :mode], allow_nil: true}

  scope :up, -> {where mode: 'up'}
  scope :down, -> {where mode: 'down'}


  def up?
    self.mode == 'up'
  end

  def down?
    self.mode == 'down'
  end
end
