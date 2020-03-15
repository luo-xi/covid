import React, { Component } from 'react';
import * as d3 from 'd3';
import * as util from '../../util';
import './StackedChart.css';

class StackedChart extends Component {
    constructor(props) {
        super(props);
        this.margin = ({ top: 20, right: 20, bottom: 30, left: 50 })
    }

    componentDidMount() {
        const { id, width, height, confirmed, recovered, deaths } = this.props;
        this.processData();
        this.svg = util.createSVG(id, width, height, [0, 0, width, height]);

        this.yAxis = g => g
            .attr("transform", `translate(${this.margin.left},0)`)
            .call(d3.axisLeft(this.y))
            .call(g => g.select(".domain").remove())
            .call(g => g.select(".tick:last-of-type text")
                .attr("x", 3)
                .attr("y", 5)
                .attr("text-anchor", "end")
                .attr("font-weight", "bold")
                .attr("transform", "rotate(-90)")
                .text(this.props.y))
        const xAxis = g => g
            .attr("transform", `translate(0,${height - this.margin.bottom})`)
            .call(d3.axisBottom(this.x).ticks(8).tickFormat(d3.timeFormat('%m/%d')).tickSizeOuter(0))

        this.series = d3.stack().keys(Object.keys(this.total[0]).slice(1))(this.total)
        this.y = d3.scaleLinear()
            .domain([0, d3.max(this.series, d => d3.max(d, d => d[1]))]).nice()
            .range([height - this.margin.bottom, this.margin.top])

        this.x = d3.scaleTime()
            .domain(d3.extent(this.total, d => d.date))
            .range([this.margin.left, width - this.margin.right])

        this.area = d3.area()
            .curve(d3.curveLinear)
            .x(d => this.x(d.data.date))
            .y0(d => this.y(d[0]))
            .y1(d => this.y(d[1]))


        const color = d3.scaleOrdinal()
            .domain(Object.keys(this.total[0]).slice(1))
            .range(d3.schemeCategory10)

        this.svg.append("g")
            .selectAll("path")
            .data(this.series)
            .join("path")
            .attr("fill", ({ key }) => color(key))
            .attr("d", this.area)
            .append("title")
            .text(({ key }) => key);

        this.svg.append("g")
            .call(xAxis)
            .selectAll('text')
            .attr("y", 0)
            .attr("x", 0)
            .attr("dy", "1.8em")

        this.svg.append("g")
            .attr("id", "y-axis")
            .call(this.yAxis);

    }

    processData() {
        const { confirmed, recovered, deaths } = this.props;
        this.total = [];
        //console.log(recovered)
        for (let i = 1; i < confirmed.length; i++) {
            for (let j = 0; j < Math.min(confirmed[i].data.length, recovered[i].data.length, deaths[i].data.length); j++) {
                if (this.total[j] === undefined) this.total.push({});
                if (this.total[j].date === undefined) this.total[j].date = confirmed[i].data[j].date;
                if (this.total[j].active === undefined) this.total[j].active = 0;
                if (this.total[j].recovered === undefined) this.total[j].recovered = 0;
                if (this.total[j].deaths === undefined) this.total[j].deaths = 0;

                this.total[j].active += confirmed[i].data[j].value - recovered[i].data[j].value - deaths[i].data[j].value;
                this.total[j].recovered += recovered[i].data[j].value;
                this.total[j].deaths += deaths[i].data[j].value;
                //console.log(recovered[0].data[0].value)
            }
        }
        this.total.forEach((d) => { if (typeof d.date === 'string') d.date = d3.timeParse("%m/%d/%Y")(d.date + '20') });
        //this.total.pop();
    }

    componentDidUpdate() {
        const { selected, confirmed, recovered, deaths, height } = this.props;

        this.selectedData = [];
        if (selected != null && selected.length > 0) {
            for (let i = 0; i < confirmed.length; i++) {
                if (Array.isArray(selected) && selected.indexOf(confirmed[i].province + ', ' + confirmed[i].country) >= 0) {
                    for (let j = 0; j < Math.min(confirmed[i].data.length, recovered[i].data.length, deaths[i].data.length); j++) {
                        if (this.selectedData[j] === undefined) this.selectedData.push({});
                        if (this.selectedData[j].date === undefined) this.selectedData[j].date = confirmed[i].data[j].date;
                        if (this.selectedData[j].active === undefined) this.selectedData[j].active = 0;
                        if (this.selectedData[j].recovered === undefined) this.selectedData[j].recovered = 0;
                        if (this.selectedData[j].deaths === undefined) this.selectedData[j].deaths = 0;
        
                        this.selectedData[j].active += confirmed[i].data[j].value - recovered[i].data[j].value - deaths[i].data[j].value;
                        this.selectedData[j].recovered += recovered[i].data[j].value;
                        this.selectedData[j].deaths += deaths[i].data[j].value;
                    }
                }
            }
        }
        if (!this.selectedData || this.selectedData.length === 0) {
            this.series = d3.stack().keys(Object.keys(this.total[0]).slice(1))(this.total)
            this.y = d3.scaleLinear()
                .domain([0, d3.max(this.series, d => d3.max(d, d => d[1]))]).nice()
                .range([height - this.margin.bottom, this.margin.top])

                this.area = d3.area()
                    .curve(d3.curveLinear)
                    .x(d => this.x(d.data.date))
                    .y0(d => this.y(d[0]))
                    .y1(d => this.y(d[1]))

                this.svg.select("#y-axis")
                    .transition()
                    .duration(2000)
                    .call(this.yAxis);

                this.svg.selectAll("path")
                    .data(this.series)
                    .transition()
                    .duration(2000)
                    .attr("d", this.area)
                    .end();
        } else {
            this.selectedData.forEach((d) => { if (typeof d.date === 'string') d.date = d3.timeParse("%m/%d/%Y")(d.date + '20') });
            //this.selectedData.pop();

            if (this.svg) {
                this.series = d3.stack().keys(Object.keys(this.selectedData[0]).slice(1))(this.selectedData)
                this.y = d3.scaleLinear()
                    .domain([0, d3.max(this.series, d => d3.max(d, d => d[1]))]).nice()
                    .range([height - this.margin.bottom, this.margin.top])

                this.area = d3.area()
                    .curve(d3.curveLinear)
                    .x(d => this.x(d.data.date))
                    .y0(d => this.y(d[0]))
                    .y1(d => this.y(d[1]))

                this.svg.select("#y-axis")
                    .transition()
                    .duration(2000)
                    .call(this.yAxis);

                this.svg.selectAll("path")
                    .data(this.series)
                    .transition()
                    .duration(2000)
                    .attr("d", this.area)
                    .end();
            }
        }
    }

    render() {
        return (
            <div id={this.props.id}>
            </div>
        )
    }
}
export default StackedChart;