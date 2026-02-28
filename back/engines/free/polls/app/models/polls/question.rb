# frozen_string_literal: true

# == Schema Information
#
# Table name: polls_questions
#
#  id             :uuid             not null, primary key
#  phase_id       :uuid             not null
#  title_multiloc :jsonb            not null
#  ordering       :integer
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#  question_type  :string           default("single_option"), not null
#  max_options    :integer
#  deleted_at     :datetime
#
# Indexes
#
#  index_polls_questions_on_deleted_at  (deleted_at)
#  index_polls_questions_on_phase_id    (phase_id)
#
module Polls
  class Question < ApplicationRecord
    acts_as_paranoid
    QUESTION_TYPES = %w[single_option multiple_options]

    acts_as_list column: :ordering, top_of_list: 0, add_new_at: :bottom, scope: %i[phase_id]

    belongs_to :phase
    has_many :options, class_name: 'Polls::Option', dependent: :destroy

    validates :title_multiloc, presence: true, multiloc: { presence: true }
    validates :question_type, presence: true, inclusion: { in: QUESTION_TYPES }
    validates :max_options, numericality: { only_integer: true, greater_than_or_equal_to: 1 }, allow_nil: true, if: :multiple_options?

    def single_option?
      question_type == 'single_option'
    end

    def multiple_options?
      question_type == 'multiple_options'
    end

    def project_id
      phase.try(:project_id)
    end
  end
end
