# frozen_string_literal: true

class MyAmazingJob < ApplicationJob
  queue_as :default

  # self.priority = 90 # pretty low priority (lowest is 100)

  def run
    puts '------------------------'
    puts 'Hello, fom MyAmazingJob!'
    puts '------------------------'
  end
end
