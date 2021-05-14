class ToxicityDetectionJob < ApplicationJob
  queue_as :default

  def run obj, options={}
    raise 'prrt'
    ToxicityDetectionService.new.flag_toxicity! obj, options
  end
end