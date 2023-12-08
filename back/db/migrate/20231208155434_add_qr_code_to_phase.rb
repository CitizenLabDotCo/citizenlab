# frozen_string_literal: true

class AddQrCodeToPhase < ActiveRecord::Migration[7.0]
  def change
    add_column :phases, :qr_code, :jsonb
  end
end
