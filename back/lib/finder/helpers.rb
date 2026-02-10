# frozen_string_literal: true

module Finder
  ## Finder::Helpers
  module Helpers
    protected

    def where(*)
      records.where(*)
    end

    def order(arg)
      records.order(arg)
    end

    def scope(scope_name, *)
      records.send(scope_name, *) if records.respond_to?(scope_name)
    end

    def beginning_of_day(param)
      Time.zone.parse(param).beginning_of_day
    end

    def end_of_day(param)
      Time.zone.parse(param).end_of_day
    end
  end
end
