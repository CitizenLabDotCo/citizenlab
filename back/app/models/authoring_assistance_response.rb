# == Schema Information
#
# Table name: authoring_assistance_responses
#
#  id                 :uuid             not null, primary key
#  idea_id            :uuid             not null
#  prompt_response    :jsonb            not null
#  custom_free_prompt :string
#  created_at         :datetime         not null
#  updated_at         :datetime         not null
#  deleted_at         :datetime
#
# Indexes
#
#  index_authoring_assistance_responses_on_deleted_at  (deleted_at)
#  index_authoring_assistance_responses_on_idea_id     (idea_id)
#
# Foreign Keys
#
#  fk_rails_...  (idea_id => ideas.id)
#
class AuthoringAssistanceResponse < ApplicationRecord
  acts_as_paranoid
  belongs_to :idea

  validates :idea, presence: true
end
