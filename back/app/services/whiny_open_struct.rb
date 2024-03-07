# frozen_string_literal: true

# rubocop:disable Style/OpenStructUse

# Latest OpenStruct implementation doesn't define `respond_to_missing?` method
# https://github.com/ruby/ruby/blob/v3_2_0/lib/ostruct.rb
# rubocop:disable Style/MissingRespondToMissing

# Inspired by https://stackoverflow.com/a/16905766
class WhinyOpenStruct < OpenStruct
  def initialize(hash, raise_exception: true)
    @raise_exception = raise_exception
    super(hash)
  end

  # See https://github.com/ruby/ruby/blob/v2_7_6/lib/ostruct.rb#L99
  def method_missing(meth, *args)
    if !meth.to_s.end_with?('=') && !@table.key?(meth)
      msg = "No '#{meth}' member set yet"
      @raise_exception ? raise(NoMethodError, msg) : ErrorReporter.report_msg(msg)
    end

    super
  end
end
# rubocop:enable Style/OpenStructUse
# rubocop:enable Style/MissingRespondToMissing
