# frozen_string_literal: true

class SaveTempRemoteFileJob < ApplicationJob
  self.priority = 30 # So, it's more important than default 50

  def run(model, remote_url_field_names)
    CarrierwaveTempRemote.save_files!(model, remote_url_field_names)
  end
end
