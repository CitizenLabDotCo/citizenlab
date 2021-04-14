module Messenger
  class Base
    EmptyBodyError = Class.new(StandardError)
    NoRecipientError = Class.new(StandardError)

    class<< self
      attr_accessor :defaults_message_values_assigned

      def with(**kwargs)
        messenger = new(kwargs)
        Execution.new(messenger)
      end

      def default(**kwargs)
        define_default_message_values(kwargs)
        self.defaults_message_values_assigned = true
      end

      def define_default_message_values(to: nil, from: nil)
        define_instance_method(:default_to) { to }
        define_instance_method(:default_from) { from }
      end
    end

    attr_reader :params
    attr_accessor :encoded_message

    delegate :define_default_message_values, :defaults_message_values_assigned, to: :class

    def initialize(params)
      define_default_message_values unless defaults_message_values_assigned

      @params = params
    end

    def run(action)
      @params[:action] = action
      result = send(:action)

      self.encoded_message = result.is_a?(Messenger::Message) ? result : message
      self
    end

    def deliver!
      ::Messenger::DeliveryJob.perform_now(encoded_message)
    end

    def deliver_later(*args)
      ::Messenger::DeliveryJob.set(*args).perform_later(encoded_message)
    end

    def message(**kwargs, &blk)
      yield(message) if blk

      kwargs = params.merge(kwargs)

      kwargs[:to]   ||= default_to
      kwargs[:from] ||= default_from

      raise EmptyBodyError if kwargs[:body].blank?
      raise NoRecipientError if kwargs[:to].blank?

      ::Messenger::Message.new(kwargs)
    end

    class Execution
      attr_reader :messenger_instance

      def initialize(messenger_instance)
        @messenger_instance = messenger_instance
      end

      def respond_to_missing?(method_name, *_args)
        messenger.respond_to?(method_name)
      end

      def method_missing(method_name, *_args, &_blk)
        messenger_instance.tap do |messenger|
          messenger.run(method_name)
        end
      end
    end
  end
end
