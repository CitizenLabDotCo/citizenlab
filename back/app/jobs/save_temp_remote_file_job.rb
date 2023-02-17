# frozen_string_literal: true

class SaveTempRemoteFileJob < ApplicationJob
  self.priority = 100

  def run(model, remote_url_field_names)
    CarrierwaveTempRemote.save_files!(model, remote_url_field_names)
  end
end
