require 'active_support/concern'

module OutletRenderer
  extend ActiveSupport::Concern

  included do
    helper_method :render_outlet
    delegate :outlets, to: :class
  end

  class_methods do
    attr_reader :outlets

    def outlet(outlet_id, &blk)
      @outlets ||= {}
      @outlets[outlet_id] = blk
    end
  end

  def render_outlet(outlet_id, **locals)
    kwargs = outlets[outlet_id].call(locals)
    render partial: kwargs[:render], locals: kwargs.except(:render)
  end
end
