# frozen_string_literal: true

module Analysis
  class AutoTaggingTask < BackgroundTask
    AUTO_TAGGING_METHODS = %w[language platform_topic nlp_topic sentiment controversial]

    validates :auto_tagging_method, inclusion: { in: AUTO_TAGGING_METHODS }

    def execute
      atm = AutoTaggingMethod::Base.for_auto_tagging_method(auto_tagging_method, analysis, self)
      atm.execute
    end
  end
end
