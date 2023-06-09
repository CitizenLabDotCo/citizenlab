# frozen_string_literal: true

# == Schema Information
#
# Table name: experiments
#
#  id         :uuid             not null, primary key
#  name       :string           not null
#  treatment  :string           not null
#  payload    :string
#  user_id    :uuid
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_experiments_on_user_id  (user_id)
#
# Foreign Keys
#
#  fk_rails_...  (user_id => users.id)
#
class Experiment < ApplicationRecord
  belongs_to :user

  validates :name, presence: true
  validates :treatment, presence: true
end