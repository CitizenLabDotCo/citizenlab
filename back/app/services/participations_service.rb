class ParticipationsService
  include Singleton

  def phase_participation(phase)
    participations = phase_participations(phase)

    # For other requests, some kind of filtering might be applied here
    format_participation_data(participations)
  end

  private

  def initialize
    @phase_participations = {}
  end

  # Fetch and cache participations in singleton for a phase
  def phase_participations(phase)
    @phase_participations[phase.id] ||= begin
      phase.ideas.map do |idea|
        {
          id: idea.id,
          user_id: idea.author_id,
          user_custom_field_values: idea.author.custom_field_values
        }
      end
                                     end
  end

  def format_participation_data(participations)
    {
      participations: {
        count: participations.count
      },
      participants: {
        count: participations.map { |p| p[:user_id] }.uniq.count,
        demographics: [
          { tbc: 'tbc' } # Placeholder for demographics data
        ]
      }
    }
  end
end