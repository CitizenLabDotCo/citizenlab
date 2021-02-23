require 'active_support/concern'

module OutletRenderer
  extend ActiveSupport::Concern

  included do
    helper_method :render_outlet
    delegate :outlets, to: :class
  end

  class_methods do
    def outlets
      @outlets ||= {}
    end

    def outlet(outlet_id, &blk)
      outlets[outlet_id] = blk
    end
  end

  def render_outlet(outlet_id, **locals)
    return unless outlet_renderable?(outlet_id, locals)

    render outlets[outlet_id].call(locals)
  end

  private

  def outlet_renderable?(outlet_id, locals)
    outlets.present? && outlets[outlet_id].respond_to?(:call) &&
      outlets[outlet_id].call(locals) && outlets[outlet_id].call(locals).key?(:partial, :locals)
  end
end
