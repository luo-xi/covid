import React, { Component } from 'react';
import * as d3 from 'd3';
import * as util from '../../util';
import './AreaChart.css';

class AreaChart extends Component {
    constructor(props) {
        super(props);
        this.margin = ({ top: 20, right: 20, bottom: 30, left: 50 })
    }

    componentDidMount() {
        const { id, width, height } = this.props;
        this.processData();
        this.svg = util.createSVG(id, width, height, [0, 0, width, height]);
        const curve = d3.curveLinear
        const yAxis = g => g
            .attr("transform", `translate(${this.margin.left},0)`)
            .call(d3.axisLeft(y))
            .call(g => g.select(".domain").remove())
            .call(g => g.select(".tick:last-of-type text").clone()
                .attr("x", 3)
                .attr("y", 5)
                .attr("text-anchor", "end")
                .attr("font-weight", "bold")
                .attr("transform", "rotate(-90)")
                .text(this.props.y))
        const xAxis = g => g
            .attr("transform", `translate(0,${height - this.margin.bottom})`)
            .call(d3.axisBottom(x).ticks(width / 70).tickFormat(d3.timeFormat('%m/%d')).tickSizeOuter(0))

        const y = d3.scaleLinear()
            .domain([0, d3.max(this.total, d => d.value)]).nice()
            .range([height - this.margin.bottom, this.margin.top])

        const x = d3.scaleTime()
            .domain(d3.extent(this.total, d => d.date))
            .range([this.margin.left, width - this.margin.right])

        this.area = d3.area()
            .curve(curve)
            .x(d => x(d.date))
            .y0(y(0))
            .y1(d => y(d.value))


        this.svg.append("path")
            .datum(this.total)
            .attr("fill", "steelblue")
            .attr("d", this.area)

        this.svg.append("path")
            .attr("class", "selected")
            .attr("fill", this.props.color)
            .attr("class", "selected")

        this.svg.append("g")
            .call(xAxis)
            .selectAll('text')
            .attr("y", 0)
            .attr("x", 15)
            .attr("dy", "1.5em")
            .attr("transform", "rotate(30)")

        this.svg.append("g")
            .call(yAxis);

    }

    processData() {
        const { data } = this.props;
        this.total = data[0].data;
        for (let i = 1; i < data.length; i++) {
            data[i].data.forEach((e, j) => {
                this.total[j].value += e.value;
            });
        }
        this.total.forEach((d) => {if(typeof d.date === 'string') d.date = d3.timeParse("%m/%d/%Y")(d.date + '20')});
        //this.total.pop();
    }

    update() {
        const { selected, data } = this.props;

        this.selectedData = null;

        if (selected && selected.length > 0) {
            for (let i = 0; i < data.length; i++) {
                if (Array.isArray(selected) && selected.indexOf(data[i].province + ', ' + data[i].country) >= 0) {
                    if (Array.isArray(this.selectedData)) {
                        data[i].data.forEach((e, j) => {
                            this.selectedData[j].value += e.value;
                        });
                    } else {
                        this.selectedData = JSON.parse(JSON.stringify(data[i].data));
                    }
                }
            }
        }
        
        if (!this.selectedData || this.selectedData.length === 0) this.selectedData = data[0].data.map((e) => {
            return {
                date: e.date,
                value: 0
            }
        });
        if (Array.isArray(this.selectedData)) {
            this.selectedData.forEach((d) => { if (typeof d.date === 'string') d.date = d3.timeParse("%m/%d/%Y")(d.date + '20') });
            //this.selectedData.pop();
            if (this.svg)
                this.svg.select(".selected")
                    .datum(this.selectedData)
                    .transition()
                    .duration(2000)
                    .attr("d", this.area)
                    .end();
        }
    }

    render() {
        return (
            <div id={this.props.id}>
                {this.update()}
            </div>
        )
    }
}
export default AreaChart;