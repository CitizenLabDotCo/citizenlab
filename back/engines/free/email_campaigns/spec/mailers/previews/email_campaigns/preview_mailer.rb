# frozen_string_literal: true

class PreviewMailer < ActionMailer::Preview
  # Override the +call+ method to wrap it in a rolled-back transaction. This simplifies
  # writing preview mailers that rely on the database. Any new records or DB changes made
  # during rendering the preview will be rolled back.
  def self.call(...)
    message = nil

    ActiveRecord::Base.transaction do
      message = super(...)
      raise ActiveRecord::Rollback
    end

    message
  end
end
