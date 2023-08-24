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
#
# Indexes
#
#  index_analysis_tags_on_analysis_id           (analysis_id)
#  index_analysis_tags_on_analysis_id_and_name  (analysis_id,name) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (analysis_id => analysis_analyses.id)
#
module Analysis
  class Tag < ::ApplicationRecord
    TAG_TYPES = %w[custom language platform_topic nlp_topic sentiment controversial]

    belongs_to :analysis
    has_many :taggings, class_name: 'Analysis::Tagging', dependent: :destroy
    has_many :inputs, class_name: 'Idea', through: :taggings

    validates :name, presence: true, uniqueness: { scope: %i[analysis_id tag_type] }
    validates :tag_type, inclusion: { in: TAG_TYPES }, allow_blank: false
  end
end
