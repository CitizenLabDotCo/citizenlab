# == Schema Information
#
# Table name: polls_questions
#
#  id                         :uuid             not null, primary key
#  participation_context_id   :uuid             not null
#  participation_context_type :string           not null
#  title_multiloc             :jsonb            not null
#  ordering                   :integer
#  created_at                 :datetime         not null
#  updated_at                 :datetime         not null
#  question_type              :string           default("single_option"), not null
#  max_options                :integer
#
# Indexes
#
#  index_poll_questions_on_participation_context  (participation_context_type,participation_context_id)
#
module Polls
	class Question < ApplicationRecord

    QUESTION_TYPES = %w(single_option multiple_options)

		acts_as_list column: :ordering, top_of_list: 0, add_new_at: :bottom, scope: [:participation_context_type, :participation_context_id]

    belongs_to :participation_context, polymorphic: true
    has_many :options, class_name: 'Polls::Option', dependent: :destroy

		validates :title_multiloc, presence: true, multiloc: {presence: true}
    validates :question_type, presence: true, inclusion: {in: QUESTION_TYPES}
    validates :max_options, numericality: {only_integer: true, greater_than_or_equal_to: 1 }, allow_nil: true, if: :multiple_options?

    def single_option?
      question_type == 'single_option'
    end

    def multiple_options?
      question_type == 'multiple_options'
    end
	end
end
