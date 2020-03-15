import * as d3 from 'd3';

export const createSVG = (id, width, height, viewbox) => {
    return d3.select("#" + id)
        .append("svg")
        .attr("viewBox", viewbox)
        .style("width", width)
        .style("height", height);
}

export const createChord = (padAngle) => {
    return d3.chord()
        .padAngle(padAngle)
        .sortSubgroups(d3.descending)
        .sortChords(d3.descending)
        .style("overflow", "visible")
}

export const createArc = (innerRadius, outerRadius) => {
    return d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius)
}

export const createRibbon = (innerRadius) => {
    return d3.ribbon()
        .radius(innerRadius)
}
