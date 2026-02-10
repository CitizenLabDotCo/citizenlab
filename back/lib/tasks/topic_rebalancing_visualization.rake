# frozen_string_literal: true

namespace :topic_rebalancing do
  desc 'Generate SVG visualization of topic rebalancing activities. See skipped spec in spec/services/idea_feed/topic_modeling_service_spec.rb'
  task :visualize, %i[input_file output_file] => [:environment] do |_t, args|
    input_file = args[:input_file]
    output_file = args[:output_file] || input_file.sub(/\.json$/, '.svg')

    unless input_file && File.exist?(input_file)
      puts 'Usage: rake topic_rebalancing:visualize[path/to/activities.json,output.svg]'
      puts "Error: Input file '#{input_file}' not found" if input_file
      exit 1
    end

    generator = TopicRebalancingVisualization.new(input_file)
    svg = generator.generate_svg
    File.write(output_file, svg)
    puts "SVG visualization saved to: #{output_file}"
  end
end

class TopicRebalancingVisualization
  # Layout constants
  COLUMN_WIDTH = 320
  COLUMN_GAP = 80
  TOPIC_HEIGHT = 50
  SUBTOPIC_HEIGHT = 40
  TOPIC_GAP = 15
  SUBTOPIC_GAP = 8
  SUBTOPIC_INDENT = 20
  HEADER_HEIGHT = 60
  PADDING = 40
  MAX_TITLE_LENGTH = 50
  MAX_SUBTOPIC_TITLE_LENGTH = 45

  # Colors
  COLORS = {
    created: '#90EE90',   # Light green
    updated: '#FFD700',   # Gold
    unchanged: '#F5F5F5', # White smoke
    removed: '#FFCCCB'    # Light red
  }.freeze

  SUBTOPIC_COLORS = {
    created: '#B8F4B8',   # Lighter green
    updated: '#FFE766',   # Lighter gold
    unchanged: '#FAFAFA', # Lighter smoke
    removed: '#FFE0E0'    # Lighter red
  }.freeze

  def initialize(input_file)
    @activities = JSON.parse(File.read(input_file))
    @steps = build_steps
  end

  LEGEND_HEIGHT = 50

  def generate_svg
    width = calculate_width
    height = calculate_height

    <<~SVG
      <?xml version="1.0" encoding="UTF-8"?>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 #{width} #{height}" width="#{width}" height="#{height}">
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#666"/>
          </marker>
          <style>
            .header { font-family: Arial, sans-serif; font-size: 14px; font-weight: bold; fill: #333; }
            .subheader { font-family: Arial, sans-serif; font-size: 11px; fill: #666; }
            .topic-title { font-family: Arial, sans-serif; font-size: 11px; fill: #333; }
            .subtopic-title { font-family: Arial, sans-serif; font-size: 10px; fill: #555; }
            .removed-title { font-family: Arial, sans-serif; font-size: 11px; fill: #999; text-decoration: line-through; }
            .removed-subtopic-title { font-family: Arial, sans-serif; font-size: 10px; fill: #999; text-decoration: line-through; }
            .topic-rect { stroke: #999; stroke-width: 1; }
            .subtopic-rect { stroke: #aaa; stroke-width: 1; }
            .removed-rect { stroke: #999; stroke-width: 1; stroke-dasharray: 4,2; }
            .arrow { stroke: #666; stroke-width: 1.5; fill: none; marker-end: url(#arrowhead); }
            .legend-label { font-family: Arial, sans-serif; font-size: 10px; fill: #333; }
          </style>
        </defs>
        #{render_legend}
        #{render_arrows}
        #{render_columns}
      </svg>
    SVG
  end

  private

  def build_steps # rubocop:disable Metrics/CyclomaticComplexity,Metrics/PerceivedComplexity
    steps = []

    # Step 0: Initial state from first activity's update_log old values
    initial_topics = {}
    first_activity = @activities.first
    payload = first_activity.dig('arguments', 4, 'payload')

    payload['update_log']&.each do |update|
      topic_id = update['topic_id']
      old_title = update.dig('title_multiloc', 'old', 'en') || update.dig('title_multiloc', 'old')&.values&.first
      initial_topics[topic_id] = {
        id: topic_id,
        title: old_title,
        status: :unchanged,
        parent_id: nil,
        children: []
      }
    end

    steps << {
      label: 'Initial',
      input_count: nil,
      topics: build_topic_hierarchy(initial_topics.values)
    }

    # Subsequent steps: Apply each activity's changes
    current_topics = initial_topics.dup

    @activities.each_with_index do |activity, idx|
      payload = activity.dig('arguments', 4, 'payload')
      input_count = payload['input_count']

      # Track which topics were modified in this step
      step_topics = {}

      # Mark topics that will be removed
      removed_ids = Set.new
      payload['removal_log']&.each do |removal|
        removed_ids << removal['topic_id']
      end

      # Copy existing topics and mark removed ones
      current_topics.each do |topic_id, topic|
        step_topics[topic_id] = if removed_ids.include?(topic_id)
          topic.merge(status: :removed, children: topic[:children].map { |c| c.merge(status: :removed) })
        else
          topic.merge(status: :unchanged, children: topic[:children].map { |c| c.merge(status: :unchanged) })
        end
      end

      # Apply updates
      payload['update_log']&.each do |update|
        topic_id = update['topic_id']
        new_title = update.dig('title_multiloc', 'new', 'en') || update.dig('title_multiloc', 'new')&.values&.first

        if step_topics[topic_id]
          old_title = step_topics[topic_id][:title]
          if old_title != new_title
            step_topics[topic_id] = step_topics[topic_id].merge(
              title: new_title,
              status: :updated
            )
          end
        end
      end

      # Apply creations - track parent relationships
      parent_map = {} # Maps topic_id to its children
      payload['creation_log']&.each do |creation|
        topic_id = creation['topic_id']
        parent_id = creation['parent_id']
        title = creation.dig('title_multiloc', 'en') || creation['title_multiloc']&.values&.first

        topic_data = {
          id: topic_id,
          title: title,
          status: :created,
          parent_id: parent_id,
          children: []
        }

        if parent_id
          # This is a subtopic - add to parent's children
          parent_map[parent_id] ||= []
          parent_map[parent_id] << topic_data
        else
          # This is a root topic
          step_topics[topic_id] = topic_data
        end
      end

      # Attach subtopics to their parents
      parent_map.each do |parent_id, children|
        if step_topics[parent_id]
          step_topics[parent_id][:children] = children
        end
      end

      steps << {
        label: "Step #{idx + 1}",
        input_count: input_count,
        topics: build_topic_hierarchy(step_topics.values)
      }

      # Prepare for next iteration - remove the removed topics
      current_topics = step_topics.reject { |_, t| t[:status] == :removed }
      current_topics.transform_values! do |t|
        t.merge(
          status: :unchanged,
          children: t[:children].reject { |c| c[:status] == :removed }.map { |c| c.merge(status: :unchanged) }
        )
      end
    end

    steps
  end

  def build_topic_hierarchy(topics)
    # Sort root topics by title, with their children attached
    topics.select { |t| t[:parent_id].nil? }
      .sort_by { |t| t[:title]&.downcase || '' }
      .map do |topic|
        topic.merge(children: (topic[:children] || []).sort_by { |c| c[:title]&.downcase || '' })
      end
  end

  def calculate_width
    (PADDING * 2) + (@steps.length * COLUMN_WIDTH) + ((@steps.length - 1) * COLUMN_GAP)
  end

  def calculate_height
    max_height = @steps.map { |s| calculate_column_height(s[:topics]) }.max
    (PADDING * 2) + LEGEND_HEIGHT + HEADER_HEIGHT + max_height
  end

  def calculate_column_height(topics)
    height = 0
    topics.each do |topic|
      height += TOPIC_HEIGHT + TOPIC_GAP
      topic[:children].each do
        height += SUBTOPIC_HEIGHT + SUBTOPIC_GAP
      end
    end
    height
  end

  def render_legend
    legend_y = PADDING
    legend_items = [
      { color: COLORS[:created], label: 'Created' },
      { color: COLORS[:updated], label: 'Updated' },
      { color: COLORS[:unchanged], label: 'Unchanged' },
      { color: COLORS[:removed], label: 'Removed', dashed: true }
    ]

    elements = []
    x_offset = PADDING

    legend_items.each do |item|
      rect_class = item[:dashed] ? 'removed-rect' : 'topic-rect'
      elements << %(<rect x="#{x_offset}" y="#{legend_y}" width="20" height="15" rx="2" ry="2" fill="#{item[:color]}" class="#{rect_class}"/>)
      elements << %(<text x="#{x_offset + 25}" y="#{legend_y + 12}" class="legend-label">#{item[:label]}</text>)
      x_offset += 90
    end

    elements.join("\n")
  end

  def render_columns
    @steps.each_with_index.map do |step, col_idx|
      render_column(step, col_idx)
    end.join("\n")
  end

  def render_column(step, col_idx)
    x = PADDING + (col_idx * (COLUMN_WIDTH + COLUMN_GAP))
    y = PADDING + LEGEND_HEIGHT

    elements = []

    # Header
    elements << %(<text x="#{x + (COLUMN_WIDTH / 2)}" y="#{y + 20}" class="header" text-anchor="middle">#{step[:label]}</text>)
    if step[:input_count]
      elements << %(<text x="#{x + (COLUMN_WIDTH / 2)}" y="#{y + 40}" class="subheader" text-anchor="middle">(#{step[:input_count]} inputs)</text>)
    end

    # Topics with subtopics
    current_y = y + HEADER_HEIGHT
    step[:topics].each do |topic|
      elements << render_topic(topic, x, current_y)
      current_y += TOPIC_HEIGHT + TOPIC_GAP

      # Render subtopics indented
      topic[:children].each do |subtopic|
        elements << render_subtopic(subtopic, x + SUBTOPIC_INDENT, current_y)
        current_y += SUBTOPIC_HEIGHT + SUBTOPIC_GAP
      end
    end

    elements.join("\n")
  end

  def render_topic(topic, x, y)
    color = COLORS[topic[:status]]
    rect_class = topic[:status] == :removed ? 'removed-rect' : 'topic-rect'
    text_class = topic[:status] == :removed ? 'removed-title' : 'topic-title'
    title = truncate_title(topic[:title] || 'Untitled', MAX_TITLE_LENGTH)

    <<~SVG
      <rect x="#{x}" y="#{y}" width="#{COLUMN_WIDTH}" height="#{TOPIC_HEIGHT}" rx="5" ry="5" fill="#{color}" class="#{rect_class}" data-topic-id="#{topic[:id]}"/>
      <text x="#{x + 10}" y="#{y + (TOPIC_HEIGHT / 2) + 4}" class="#{text_class}">#{escape_xml(title)}</text>
    SVG
  end

  def render_subtopic(subtopic, x, y)
    color = SUBTOPIC_COLORS[subtopic[:status]]
    rect_class = subtopic[:status] == :removed ? 'removed-rect' : 'subtopic-rect'
    text_class = subtopic[:status] == :removed ? 'removed-subtopic-title' : 'subtopic-title'
    title = truncate_title(subtopic[:title] || 'Untitled', MAX_SUBTOPIC_TITLE_LENGTH)
    width = COLUMN_WIDTH - SUBTOPIC_INDENT

    <<~SVG
      <rect x="#{x}" y="#{y}" width="#{width}" height="#{SUBTOPIC_HEIGHT}" rx="3" ry="3" fill="#{color}" class="#{rect_class}" data-topic-id="#{subtopic[:id]}"/>
      <text x="#{x + 8}" y="#{y + (SUBTOPIC_HEIGHT / 2) + 3}" class="#{text_class}">#{escape_xml(title)}</text>
    SVG
  end

  def render_arrows
    arrows = []

    @steps.each_cons(2).with_index do |(prev_step, next_step), col_idx|
      prev_positions = calculate_topic_positions(prev_step[:topics])
      next_positions = calculate_topic_positions(next_step[:topics])

      # Find topics that exist in both columns (same id, not removed)
      prev_step[:topics].each do |topic|
        next if topic[:status] == :removed

        if next_positions.key?(topic[:id])
          next_topic = next_step[:topics].find { |t| t[:id] == topic[:id] }
          next if next_topic&.dig(:status) == :removed

          from_y = prev_positions[topic[:id]]
          to_y = next_positions[topic[:id]]
          arrows << render_arrow(col_idx, from_y, to_y)
        end
      end
    end

    arrows.join("\n")
  end

  def calculate_topic_positions(topics)
    positions = {}
    current_y = PADDING + LEGEND_HEIGHT + HEADER_HEIGHT

    topics.each do |topic|
      positions[topic[:id]] = current_y + (TOPIC_HEIGHT / 2)
      current_y += TOPIC_HEIGHT + TOPIC_GAP

      topic[:children].each do
        current_y += SUBTOPIC_HEIGHT + SUBTOPIC_GAP
      end
    end

    positions
  end

  def render_arrow(col_idx, from_y, to_y)
    from_x = PADDING + (col_idx * (COLUMN_WIDTH + COLUMN_GAP)) + COLUMN_WIDTH
    to_x = PADDING + ((col_idx + 1) * (COLUMN_WIDTH + COLUMN_GAP))

    # Quadratic bezier curve
    mid_x = (from_x + to_x) / 2
    control_offset = (to_y - from_y).abs / 3

    if from_y == to_y
      # Straight line for same position
      %(<path d="M #{from_x} #{from_y} L #{to_x} #{to_y}" class="arrow"/>)
    else
      # Curved line
      %(<path d="M #{from_x} #{from_y} Q #{mid_x} #{from_y + (control_offset * (to_y > from_y ? 1 : -1))}, #{to_x} #{to_y}" class="arrow"/>)
    end
  end

  def truncate_title(title, max_length)
    if title.length > max_length
      "#{title[0, max_length - 3]}..."
    else
      title
    end
  end

  def escape_xml(text)
    text.to_s
      .gsub('&', '&amp;')
      .gsub('<', '&lt;')
      .gsub('>', '&gt;')
      .gsub('"', '&quot;')
      .gsub("'", '&apos;')
  end
end
