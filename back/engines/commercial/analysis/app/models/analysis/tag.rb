module Analysis
    class Tag < ::ApplicationRecord

      TAG_TYPES = %w[custom language platform_topic nlp_topic sentiment controversial]
  
      belongs_to :analysis
  
      acts_as_list scope: :analysis
  
      validates :name, presence: true, uniqueness: { scope: :analysis_id }
      validates :analysis, presence: true
      validates :tag_type, inclusion: { in: TAG_TYPES }, allow_blank: false
    end
  end