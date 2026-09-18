# frozen_string_literal: true

class WebApi::V1::OpinionGroupsSerializer < WebApi::V1::BaseSerializer
  set_id :phase_id
  set_type :opinion_groups

  attributes :parameters, :stats, :groups, :statements, :axes, :consensus, :divisive,
    :points, :demographic_fields, :participation_balance
end
