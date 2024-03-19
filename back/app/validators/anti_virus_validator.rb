# frozen_string_literal: true

class AntiVirusValidator < ActiveModel::Validator
  def validate(record)
    return unless ENV.fetch('CLAMD_ENABLED', false)

    if file(record).path && File.exist?(file(record).path) && Clamby.virus?(file(record).path)
      record.errors.add(options[:attribute_name].to_sym, 'infected file')
    end
  end

  private

  def file(record)
    record.public_send(options[:attribute_name].to_sym)
  end
end
