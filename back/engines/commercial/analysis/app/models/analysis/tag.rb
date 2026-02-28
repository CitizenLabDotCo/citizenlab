# frozen_string_literal: true

# == Schema Information
#
# Table name: analysis_tags
#
#  id          :uuid             not null, primary key
#  name        :string           not null
#  tag_type    :string           not null
#  analysis_id :uuid             not null
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#  deleted_at  :datetime
#
# Indexes
#
#  index_analysis_tags_on_analysis_id           (analysis_id)
#  index_analysis_tags_on_analysis_id_and_name  (analysis_id,name) UNIQUE WHERE (deleted_at IS NULL)
#  index_analysis_tags_on_deleted_at            (deleted_at)
#
# Foreign Keys
#
#  fk_rails_...  (analysis_id => analysis_analyses.id)
#
module Analysis
  class Tag < ::ApplicationRecord
    acts_as_paranoid
    TAG_TYPES = %w[custom onboarding_example language platform_topic nlp_topic sentiment controversial]

    belongs_to :analysis
    has_many :taggings, class_name: 'Analysis::Tagging', dependent: :destroy
    has_many :inputs, class_name: 'Idea', through: :taggings

    validates :name, presence: true, uniqueness: { scope: %i[analysis_id tag_type], conditions: -> { where(deleted_at: nil) } }
    validates :tag_type, inclusion: { in: TAG_TYPES }, allow_blank: false
  end
end
