module SmartGroups
  module Patches
    module SideFxTopicService
      def before_destroy(topic, user)
        super
        SmartGroups::RulesService.new.filter_by_value_references(topic.id).each(&:destroy!)
      end
    end
  end
end
