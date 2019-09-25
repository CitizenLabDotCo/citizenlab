module Polls
	class Question < ApplicationRecord
		acts_as_list column: :ordering, top_of_list: 0, add_new_at: :bottom, scope: [:participation_context_type, :participation_context_id]

    belongs_to :participation_context, polymorphic: true
    has_many :options, class_name: 'Polls::Option', dependent: :destroy

		validates :title_multiloc, presence: true, multiloc: {presence: true}
	end
end