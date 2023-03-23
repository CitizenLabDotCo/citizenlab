class Invites::FailedError < RuntimeError
  attr_accessor :errors

  def initialize(options)
    @errors = options[:errors]
  end

  def to_h
    errors.reject(&:ignore).map(&:to_h)
  end

  def to_s
    inspect
  end

  def inspect
    "#<Invites::FailedError: #{to_h}>"
  end
end
