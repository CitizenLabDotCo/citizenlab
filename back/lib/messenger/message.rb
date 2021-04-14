module Messenger
  class Message
    # needs to have all attributes a Mail has, including body.
    attr_accessor :to, :from, :body, :delivered

    def initialize(to:, from:, body:)
      @to        = to
      @from      = from
      @body      = body
      @delivered = false
    end

    def deliver
      self.delivered = true
    end

    def delivered?
      delivered
    end
  end
end
