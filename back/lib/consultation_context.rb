class ConsultationContext
  attr_reader :context

  def self.grouped_inputs(inputs)
    transitive_inputs = inputs.transitive
    nontransitive_inputs = inputs.where.not(id: transitive_inputs)
    result = {}
    transitive_inputs.pluck(:project_id).uniq.each do |project_id|
      result[new(Project.find(project_id))] = transitive_inputs.where(project_id: project_id)
    end
    nontransitive_inputs.pluck(:creation_phase_id).uniq.each do |phase_id|
      result[new(Phase.find(phase_id))] = nontransitive_inputs.where(creation_phase_id: phase_id)
    end
    result
  end

  def initialize(context)
    @context = context

    if [Phase, Project].exclude?(context.class)
      raise ClErrors::AssertionError, "Context class #{context.class} is not supported"
    end
  end

  def supports_automated_statuses?
    context.pmethod.supports_automated_statuses?
  end

  def reacting_threshold
    context.reacting_threshold if context.respond_to?(:reacting_threshold)
  end
end
