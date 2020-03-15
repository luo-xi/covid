import React, { Component } from 'react';
import * as d3 from 'd3';
import { createChord, createSVG, createRibbon, createArc } from '../../util';
import "./ChordChart.css";

class ChordChart extends Component {
    constructor(props) {
        super(props);
        this.ribbonCnt = [];
        this.handleMouseOver = this.handleMouseOver.bind(this);
        this.handleMouseOut = this.handleMouseOut.bind(this);
    }

    componentDidMount() {
        const { id, width, height, pool, matrix, color } = this.props;
        this.processData();

        const outerRadius = Math.min(width, height) * 0.5;
        const innerRadius = outerRadius - 124;

        const svg = createSVG(id, width, height, [-width / 2, -height / 2, width, height]);
        const chord = createChord(.04);
        const ribbon = createRibbon(innerRadius);
        const arc = createArc(innerRadius, innerRadius + 20);

        const chords = chord(matrix);
        //console.log(matrix);
        //console.log(chords.groups);
        const group = svg.append('g')
            .attr("id", "segments")
            .selectAll("g")
            .data(chords.groups)
            .join("g")

        group.append("path")
            .attr("fill", d => color(d.index))
            .attr("stroke", d => color(d.index))
            .attr("d", arc)
            .on("mouseover", this.handleMouseOver)
            .on("mouseout", this.handleMouseOut)

        group.selectAll("path")
            .attr("id", d => pool[d.index])

        group.append("text")
            .each(d => { d.angle = (d.startAngle + d.endAngle) / 2; })
            .attr("dy", ".35em")
            .attr("transform", d => `
                rotate(${(d.angle * 180 / Math.PI - 90)})
                translate(${innerRadius + 26})
                ${d.angle > Math.PI ? "rotate(180)" : ""}
            `)
            .attr("text-anchor", d => d.angle > Math.PI ? "end" : null)
            .text(d => pool[d.index])

        svg.append("g")
            .attr("id", "connects")
            .attr("fill-opacity", 0.67)
            .selectAll("path")
            .data(chords)
            .join("path")
            .attr("fill", d => color(d.source.index))
            .attr("d", ribbon);

        this.tooltip = this.createTooltip();
    }

    processData() {
        const { matrix } = this.props;
        this.ribbonCnt = matrix.reduce((acc, arr, i) => {
            acc.push(arr.filter((e) => e !== 0).length + acc[acc.length - 1]);
            return acc;
        }, [0]);
    }

    createTooltip() {
        return d3.select("#" + this.props.id)
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)
    }

    handleMouseOver(d, i) {
        const { pool, mouse } = this.props;

        d3.select("#segments")
            .selectAll("path")
            .style("opacity", (e) => (d !== e) ? 0.4 : 1)

        d3.select("#connects")
            .selectAll("path")
            .style("opacity", (e) => (e.source.index === d.index) ? 1 : 0.4)

        this.tooltip.transition()
            .duration(200)
            .style("opacity", .9)

        this.tooltip.html(d.value)
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px")

        mouse("mouseover", pool[d.index]);
    }

    handleMouseOut(d, i) {
        const { mouse } = this.props;

        d3.select("#segments")
            .selectAll("path")
            .style("opacity", 1)

        d3.select("#connects")
            .selectAll("path")
            .style("opacity", 1)

        this.tooltip.transition()
            .duration(200)
            .style("opacity", 0)

        mouse("mouseout");
    }

    render() {
        return <div id={this.props.id} className="chart"></div>
    }
}

export default ChordChart;