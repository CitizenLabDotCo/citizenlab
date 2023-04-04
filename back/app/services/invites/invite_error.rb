# frozen_string_literal: true

class Invites::InviteError < RuntimeError
  attr_accessor :error_key, :row, :rows, :value, :raw_error, :ignore

  def initialize(error_key, options)
    super()
    @error_key = error_key
    @row = options[:row]
    @rows = options[:rows]
    @value = options[:value]
    @raw_error = options[:raw_error]
    @ignore = options[:ignore] || false
  end

  def to_h
    h = { error: error_key }
    h[:row] = row if row
    h[:rows] = rows if rows
    h[:value] = value if value
    h[:raw_error] = raw_error if raw_error
    h[:ignore] = ignore
    h
  end

  def to_s
    "#<Invites::InviteError: #{error_key}>"
  end

  def inspect
    "#<Invites::InviteError: #{to_h}>"
  end
end
