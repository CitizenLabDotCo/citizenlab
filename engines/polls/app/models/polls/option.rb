module Polls
	class Option < ApplicationRecord
		acts_as_list column: :ordering, top_of_list: 0, add_new_at: :bottom, scope: [:question_id]

    belongs_to :question, class_name: 'Polls::Question'

		validates :title_multiloc, presence: true, multiloc: {presence: true}
	end
end