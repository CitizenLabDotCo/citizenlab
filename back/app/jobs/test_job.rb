# frozen_string_literal: true

class TestJob < ApplicationJob
  def run
    sleep 3
  end
end
