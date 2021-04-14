module Messenger
  class Message
    # needs to have all attributes a Mail has, including body.
    attr_accessor :to, :from, :body, :template_path, :template_name, :lookup_context

    def initialize(to:, from:, body:)
      @to            = to
      @from          = from
      @template_name = template_name
      @template_path = template_path
      @body          = body
    end

    def deliver

    end
  end
end
