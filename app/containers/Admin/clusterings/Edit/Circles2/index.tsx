import React, { PureComponent } from 'react';
import * as d3 from 'd3';
import { keyBy, get } from 'lodash';
import GetIdeas, { GetIdeasChildProps } from 'resources/GetIdeas';
import styled from 'styled-components';
import { ParentNode, Node } from 'services/clusterings';
import flares from './flares.json';

interface InputProps {
  structure: ParentNode;
  selectedNodes: Node[];
  onClickNode: (Node) => void;
  onShiftClickNode: (Node) => void;
}

interface DataProps {
  ideas: GetIdeasChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  .node {
    cursor: pointer;
  }

  .node:hover {
    stroke: #000;
    stroke-width: 1.5px;
  }

  .node--leaf {
    fill: white;
  }

  .label {
    color: red !important;
    fill: red !important;
    font-size: 11px;
    text-anchor: middle;
    text-shadow: 0 1px 0 #fff, 1px 0 0 #fff, -1px 0 0 #fff, 0 -1px 0 #fff;
  }

  .label,
  .node--root,
  .node--leaf {
    pointer-events: none;
  }
`;

class Circles2 extends PureComponent<Props, State> {
  ref: SVGElement;

  constructor(props: Props) {
    super(props);
    this.state = {};
    this.ref = null as any;
  }

  componentDidMount() {
    if (this.ref !== null) {
      // const svgElementReact = this.ref;
      const svgElementD3 = d3.select(this.ref);
      const margin = 20;
      const diameter = +svgElementD3.attr('width');
      const g = svgElementD3.append('g').attr('transform', 'translate(' + diameter / 2 + ',' + diameter / 2 + ')');

      const color = d3.scaleLinear()
        .domain([-1, 5])
        .range(['hsl(152,80%,80%)' as any, 'hsl(228,30%,40%)'])
        .interpolate((d3 as any).interpolateHcl);

      const pack = d3.pack()
        .size([diameter - margin, diameter - margin])
        .padding(2);

      // const root: any = d3.hierarchy(flares)
      //   .sum((d: any) => { return d.size; })
      //   .sort((a: any, b: any) => { return b.value - a.value; });

      const ideasById = keyBy(this.props.ideas.ideasList, 'id');
      const root = d3.hierarchy(this.props.structure)
        .sum((d) => {
          if (ideasById[d.id]) {
            return ideasById[d.id].attributes.upvotes_count + ideasById[d.id].attributes.downvotes_count + 1;
          }

          return 1;
        });

      const focus = root;
      const nodes = pack(root).descendants();
      let view;

      const circle = g.selectAll('circle')
        .data(nodes)
        .enter().append('circle')
        // .filter((d: any) => d)
        .attr('class', (d: any) => { return get(d, 'parent') ? get(d, 'children') ? 'node' : 'node node--leaf' : 'node node--root'; })
        .style('fill', (d: any) => { return get(d, 'children') ? color(d.depth) : null; })
        .on('click', (d: any) => {
          if (focus !== d) {
            zoom(d);
            d3.event.stopPropagation();
          }
        });

      const text = g.selectAll('text')
        .data(nodes)
        .enter().append('text')
        .attr('class', 'label')
        // .filter((d: any) => d)
        .style('fill-opacity', (d: any) => { return get(d, 'parent') === root ? 1 : 1; })
        .style('display', (d: any) => { return get(d, 'parent') === root ? 'inline' : 'inline'; })
        .text((d: any) => { return d.data.name; });

      const node = g.selectAll('circle,text');

      svgElementD3.style('background', color(-1)).on('click', () => { zoom(root); });

      zoomTo([root.x, root.y, root.r * 2 + margin]);

      function zoom(d) {
        const focus = d;

        d3.transition()
          .duration(d3.event.altKey ? 5000 : 500)
          .tween('zoom', (d: any) => {
            const i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
            return (t) => { zoomTo(i(t)); };
          });

        // transition.selectAll('text')
        //   .filter((d: any) => d)
        //   .filter((d: any) => { return d.parent === focus || svgElementReact.style.display === 'inline'; })
        //   .style('fill-opacity', (d: any) => { return d.parent === focus ? 1 : 0; })
        //   .on('start', (d: any) => { if (d.parent === focus) svgElementReact.style.display = 'inline'; });
        //   .on('end', (d: any) => { if (d.parent !== focus) bleh.style.display = 'none'; });
      }

      function zoomTo(v) {
        const k = diameter / v[2]; view = v;
        node.attr('transform', (d: any) => { return 'translate(' + (d.x - v[0]) * k + ',' + (d.y - v[1]) * k + ')'; });
        circle.attr('r', (d: any) => { return d.r * k; });
      }
    }
  }

  setRef = (ref) => {
    console.log(ref);
    this.ref = ref;
  }

  render() {
    return (
      <Container className={this.props['className']}>
        <svg className="container" ref={this.setRef} width={600} height={600} />
      </Container>
    );
  }
}

export default (inputProps: InputProps) => (
  <GetIdeas type="load-more" pageSize={250} sort="new">
    {(ideasProps) => ideasProps.ideasList ? <Circles2 {...inputProps} ideas={ideasProps} /> : null}
  </GetIdeas>
);
