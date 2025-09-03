# frozen_string_literal: true

module ExecutorTestHelper
  def self.included(base)
    base.around do |example|
      Rails.application.executor.perform { example.run }
    end
  end
end
