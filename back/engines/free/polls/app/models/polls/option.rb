# == Schema Information
#
# Table name: polls_options
#
#  id             :uuid             not null, primary key
#  question_id    :uuid
#  title_multiloc :jsonb            not null
#  ordering       :integer
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#
# Indexes
#
#  index_polls_options_on_question_id  (question_id)
#
# Foreign Keys
#
#  fk_rails_...  (question_id => polls_questions.id)
#
module Polls
	class Option < ApplicationRecord
		acts_as_list column: :ordering, top_of_list: 0, add_new_at: :bottom, scope: [:question_id]

    belongs_to :question, class_name: 'Polls::Question'
    has_many :response_options, class_name: 'Polls::ResponseOption', dependent: :destroy

		validates :title_multiloc, presence: true, multiloc: {presence: true}
	end
end
