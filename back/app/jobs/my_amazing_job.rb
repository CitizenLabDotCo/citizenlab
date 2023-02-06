# frozen_string_literal: true

class MyAmazingJob < ApplicationJob
  queue_as :default

  # self.priority = 90 # pretty low priority (lowest is 100)

  def run
    Rails.logger.info('Hello, from MyAmazingJob!')

    puts '------------------------'
    puts 'Hello, from MyAmazingJob!'
    puts '------------------------'
  end
end
