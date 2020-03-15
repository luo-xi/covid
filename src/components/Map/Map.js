import React, { Component } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css'
import './Map.css';

class Map extends Component {
    constructor(props) {
        super(props);
        this.markers = [];
    }

    componentDidMount() {
        const { data } = this.props;
        this.processData();

        this.map = L.map('map', {
            center: [33, 12],
            zoom: 2,
            attributionControl: false,
            zoomControl: true,
            doubleClickZoom: true,
            scrollWheelZoom: false,
            dragging: true,
            layers: [
                L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png'),
            ]
        });

        let confirmed_overlay = new L.LayerGroup().addTo(this.map);
        let recovered_overlay = new L.LayerGroup();
        let deaths_overlay = new L.LayerGroup();
        let hospitalised_overlay = new L.LayerGroup();

        data.forEach((e) => {
            if (this.latlng[e.datakey] && e.confirmed !== 0) {
                L.circle(this.latlng[e.datakey], {
                    color: 'red',
                    fillColor: '#f03',
                    fillOpacity: 0.5,
                    weight: 2,
                    radius: e.confirmed < 1500 ? e.confirmed * 200 : 2000 * 200 + (e.confirmed - 5000) * 20
                })
                    .bindTooltip(
                        e.province && e.province !== e.country ?
                            e.province + ', ' + e.country + ': ' + e.confirmed :
                            e.country + ': ' + e.confirmed
                    )
                    .addTo(confirmed_overlay);
            }

            if (this.latlng[e.datakey] && e.recovered !== 0) {
                L.circle(this.latlng[e.datakey], {
                    color: '#099c44',
                    fillColor: '#099c44',
                    fillOpacity: 0.5,
                    weight: 2,
                    radius: e.recovered < 1500 ? e.recovered * 200 : 2000 * 200 + (e.recovered - 5000) * 20
                })
                    .bindTooltip(
                        e.province && e.province !== e.country ?
                            e.province + ', ' + e.country + ': ' + e.recovered :
                            e.country + ': ' + e.recovered
                    )
                    .addTo(recovered_overlay);
            }

            if (this.latlng[e.datakey] && e.deaths !== 0) {
                L.circle(this.latlng[e.datakey], {
                    color: '#404040',
                    fillColor: '#404040',
                    fillOpacity: 0.5,
                    weight: 2,
                    radius: e.deaths < 1500 ? e.deaths * 200 : 2000 * 200 + (e.deaths - 5000) * 20
                })
                    .bindTooltip(
                        e.province && e.province !== e.country ?
                            e.province + ', ' + e.country + ': ' + e.deaths :
                            e.country + ': ' + e.deaths
                    )
                    .addTo(deaths_overlay);
            }

            if (this.latlng[e.datakey] && e.hospitalised !== 0) {
                L.circle(this.latlng[e.datakey], {
                    color: '#EFCC00',
                    fillColor: '#EFCC00',
                    fillOpacity: 0.5,
                    weight: 2,
                    radius: e.hospitalised < 1500 ? e.hospitalised * 200 : 2000 * 200 + (e.hospitalised - 5000) * 20
                })
                    .bindTooltip(
                        e.province && e.province !== e.country ?
                            e.province + ', ' + e.country + ': ' + e.hospitalised :
                            e.country + ': ' + e.hospitalised
                    )
                    .addTo(hospitalised_overlay);
            }
        });
        L.control.layers({
            "Confirmed": confirmed_overlay,
            "Deaths": deaths_overlay,
            "Recovered": recovered_overlay,
            "Active": hospitalised_overlay,
        }, null, { collapsed: false }).addTo(this.map);

    }

    componentWillReceiveProps(s) {
        if (s.pan.adding) {
            //console.log(s.pan.selection)
            if (this.latlng[s.pan.selection]) this.map.setView(this.latlng[s.pan.selection], 4);
        }
    }
    processData() {
        const { location } = this.props;
        this.latlng = location.reduce((acc, e) => {
            acc[e.province + ', ' + e.country] = L.latLng(e.lat, e.long);
            return acc;
        }, {});
    }

    render() {
        return (
            <div id='map'>

            </div>
        )
    }
}

export default Map;
