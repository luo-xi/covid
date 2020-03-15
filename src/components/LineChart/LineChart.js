import React, { Component } from 'react';
import * as d3 from 'd3';
import * as util from '../../util';
import './LineChart.css';

class LineChart extends Component {
    constructor(props) {
        super(props);
        this.margin = ({ top: 20, right: 20, bottom: 30, left: 50 })
        this.data = {};
    }

    componentDidMount() {
        const { id, width, height } = this.props;
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
            .call(d3.axisBottom(this.x).ticks(width / 80).tickSizeOuter(0))

        this.series = d3.stack().keys(Object.keys(this.data.total[0]).slice(1))(this.data.total)
        this.y = d3.scaleLinear()
            .domain([0, d3.max(this.data.total, d => d3.max(d.values))]).nice()
            .range([height - this.margin.bottom, this.margin.top])

        this.x = d3.scaleTime()
            .domain(d3.extent(this.data.dates))
            .range([this.margin.left, width - this.margin.right])

        this.line = d3.line()
            .defined(d => !isNaN(d))
            .x((d, i) => this.x(this.data.dates[i]))
            .y(d => {this.y(d); console.log(d)})

        const color = d3.scaleOrdinal()
            .domain(Object.keys(this.data.total.length))
            .range(d3.schemeCategory10)

        this.svg.append("g")
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .selectAll("path")
            .data(this.data.total)
            .join("path")
            .style("mix-blend-mode", "multiply")
            .attr("d", d => this.line(d.values));

            
        this.svg.append("g")
            .call(xAxis)
            .selectAll('text')
            .attr("y", 0)
            .attr("x", 9)
            .attr("dy", "1.35em")
            .attr("transform", "rotate(30)")

        this.svg.append("g")
            .attr("id", "y-axis")
            .call(this.yAxis);

    }

    processData() {
        const { data, dates } = this.props;
        this.data.total = [];
        for (let i = 1; i < data.length; i++) {
            let temp = {
                name: data[i].province ?
                    data[i].province + ", " + data[i].country : data[i].country,
                values: []
            };

            data[i].data.forEach((e, j) => {
                temp.values.push(j > 1 ? Number(e.value) - Number(data[i].data[j - 1].value) : e.value)
            })
            this.data.total.push(temp);
        }
        this.data.dates = dates.map((d) => { return d3.timeParse("%m/%d/%Y")(d + '20') });
        console.log(d3.timeParse("%m/%d/%Y")('1/22/2020'))
        //this.data.total.pop();
        console.log(this.data.total)
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
            this.series = d3.stack().keys(Object.keys(this.data.total[0]).slice(1))(this.data.total)
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
export default LineChart;