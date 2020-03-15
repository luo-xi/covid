import React, { Component } from 'react';
import * as d3 from 'd3';
import { createSVG } from '../../util';
import "./BarChart.css";

class d3BarChart extends Component {
    constructor(props) {
        super(props);
        this.margin = { top: 80, bottom: 80, left: 150, right: 50 };
    }

    componentDidMount() {
        const { id, width, height, pool } = this.props;
        this.processData();

        this.svg = createSVG(id, width, height, [0, 0, width, height]);

        this.x = d3.scaleLinear()
            .domain([0, d3.max(this.data)])
            .range([this.margin.left, width - this.margin.right])

        this.y = d3.scaleBand()
            .domain(d3.range(this.data.length))
            .range([this.margin.top, height - this.margin.bottom])
            .padding(.1)

        this.yAxis = g => g
            .attr("transform", `translate(${this.margin.left}, 0)`)
            .call(d3.axisLeft(this.y).tickFormat(i => pool[i]).tickSizeOuter(0))

        this.drawBars();
    }

    componentDidUpdate() {
        const { pool, matrix, hover } = this.props;
        this.data = hover ? matrix[pool.indexOf(hover)] : this.rawData;
        this.updateBars();
    }

    processData() {
        const { matrix } = this.props;
        this.rawData = matrix.reduce((acc1, e1, i) => {
            acc1.push(e1.reduce((acc2, e2) => acc2 + e2, 0));
            return acc1;
        }, []);
        this.data = this.rawData;
    }

    drawBars() {
        const { color } = this.props;
        this.svg.append("g")
            .attr("id", "bars-left")
            .selectAll("rect")
            .data(this.data)
            .enter()
            .append("rect")
            .attr("x", this.x(0))
            .attr("y", (d, i) => this.y(i))
            .attr("width", d => this.x(d) - this.x(0))
            .attr("height", this.y.bandwidth())
            .attr("fill", (d, i) => color(i))

        this.svg.append("g")
            .attr("id", "bars-right")
            .selectAll("rect")
            .data(this.data)
            .join("rect")
            .attr("x", d => this.x(d))
            .attr("y", (d, i) => this.y(i))
            .attr("width", 0)
            .attr("height", this.y.bandwidth())
            .attr("fill", (d, i) => color(i))
            .attr("opacity", .5)

        this.svg.append("g")
            .attr("class", "marker")
            .attr("id", "marker-left")
            .attr("fill", "black")
            .attr("text-anchor", "start")
            .selectAll("text")
            .data(this.data)
            .join("text")
            .attr("x", d => this.x(d) + 5)
            .attr("y", (d, i) => this.y(i) + this.y.bandwidth() / 2)
            .attr("dy", "0.35em")
            .text(d => d);

        this.svg.append("g")
            .attr("class", "marker")
            .attr("id", "marker-right")
            .attr("fill", "white")
            .attr("text-anchor", "start")
            .selectAll("text")
            .data(this.data)
            .join("text")
            .attr("x", d => this.x(d) + 5)
            .attr("y", (d, i) => this.y(i) + this.y.bandwidth() / 2)
            .attr("dy", "0.35em")
            .text(d => d)
            .attr("fill-opacity", 0)

        this.svg.append("g")
            .call(this.yAxis);
    }

    updateBars() {
        const { hover } = this.props;
        this.svg.select("#bars-left")
            .selectAll("rect")
            .data(this.data)
            .transition()
            .delay(0)
            .duration(500)
            .attr("x", this.x(0))
            .attr("width", d => this.x(d) - this.x(0))

        this.svg.select("#bars-right")
            .selectAll("rect")
            .data(this.data)
            .transition()
            .delay(0)
            .duration(500)
            .attr("x", d => this.x(d))
            .attr("width", (d, i) => this.x(this.rawData[i]) - this.x(d))

        this.svg.select("#marker-right")
            .selectAll("text")
            .attr("fill-opacity", 0)

        if (hover) {
            this.svg.select("#marker-right")
                .selectAll("text")
                .data(this.data)
                .attr("x", d => this.x(d) + 2)
                .attr("y", (d, i) => this.y(i) + this.y.bandwidth() / 2)
                .attr("dy", "0.35em")
                .text(d => d)

            this.svg.select("#marker-right")
                .selectAll("text")
                .transition()
                .delay(200)
                .attr("fill-opacity", hover? 1: 0)
        }
    }

    render() {
        return <div id={this.props.id} className="chart"></div>
    }
}

export default d3BarChart;