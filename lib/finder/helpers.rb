# frozen_string_literal: true

module Finder
  ## Finder::Helpers
  module Helpers
    protected

    def where(*args)
      @records = records.where(*args)
    end

    def order(arg)
      @records = records.order(arg)
    end

    def filter_records(&blk)
      @records = yield if blk
    end

    def scope(scope_name, *args)
      @records = records.send(scope_name, *args) if records.respond_to?(scope_name)
    end

    def beginning_of_day(param)
      Time.zone.parse(param).beginning_of_day
    end

    def end_of_day(param)
      Time.zone.parse(param).end_of_day
    end
  end
end
