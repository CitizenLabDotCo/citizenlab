module SmartGroups
  module Patches
    module SideFxTopicService
      def before_destroy(topic, user)
        super
        SmartGroups::RulesService.new.filter_by_rule_value(::Group.all, topic.id).destroy_all
      end
    end
  end
end
