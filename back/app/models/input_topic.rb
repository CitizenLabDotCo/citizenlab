# frozen_string_literal: true

# == Schema Information
#
# Table name: input_topics
#
#  id                   :uuid             not null, primary key
#  project_id           :uuid             not null
#  title_multiloc       :jsonb            not null
#  description_multiloc :jsonb            not null
#  icon                 :string
#  ordering             :integer          default(0), not null
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#
# Indexes
#
#  index_input_topics_on_project_id               (project_id)
#  index_input_topics_on_project_id_and_ordering  (project_id,ordering)
#
# Foreign Keys
#
#  fk_rails_...  (project_id => projects.id)
#
class InputTopic < ApplicationRecord
  acts_as_list column: :ordering, scope: [:project_id], top_of_list: 0

  belongs_to :project
  has_many :ideas_input_topics, dependent: :destroy
  has_many :ideas, through: :ideas_input_topics

  validates :title_multiloc, presence: true, multiloc: { presence: true }
  validates :description_multiloc, multiloc: { presence: false }
end
