module Analysis
  class AutoTaggingTask < BackgroundTask
    AUTO_TAGGING_METHODS = %w[language platform_topic nlp_topic sentiment controversial]

    validates :auto_tagging_method, inclusion: { in: AUTO_TAGGING_METHODS }
  end
end
