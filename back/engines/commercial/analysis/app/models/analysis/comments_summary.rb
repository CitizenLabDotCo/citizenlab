# == Schema Information
#
# Table name: analysis_comments_summaries
#
#  id                 :uuid             not null, primary key
#  idea_id            :uuid
#  background_task_id :uuid             not null
#  summary            :text
#  prompt             :text
#  accuracy           :float
#  generated_at       :datetime
#  comments_ids       :jsonb            not null
#  created_at         :datetime         not null
#  updated_at         :datetime         not null
#
# Indexes
#
#  index_analysis_comments_summaries_on_background_task_id  (background_task_id)
#  index_analysis_comments_summaries_on_idea_id             (idea_id)
#
# Foreign Keys
#
#  fk_rails_...  (background_task_id => analysis_background_tasks.id)
#  fk_rails_...  (idea_id => ideas.id)
#
module Analysis
  class CommentsSummary < ::ApplicationRecord
    belongs_to :idea
    belongs_to :background_task, class_name: 'Analysis::CommentsSummarizationTask'
    has_many :comments, through: :idea
    has_many :activities, as: :item

    delegate :analysis, :analysis_id, to: :background_task

    validates :accuracy, numericality: { in: 0..1 }, allow_blank: true
    validate :comments_ids_unique

    def comments_ids_unique
      return if comments_ids.blank?

      if comments_ids.uniq != comments_ids
        errors.add(:comments_ids, :should_have_unique_ids, message: 'The log of comments_ids associated with the comments summary contains duplicate ids')
      end
    end

    def comments_count
      comments_ids.size
    end

    def missing_comments_count
      (comments.ids - comments_ids).size
    end
  end
end
