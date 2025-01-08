# frozen_string_literal: true

class AutomatedTransitionJob < ApplicationJob
  queue_as :default

  def run
    InputStatusService.auto_transition_hourly!
  end
end
