import React, { Component } from 'react';
import Description from '../Description/Description';
import Map from '../Map/Map';
import Table from '../Table/Table';
import AreaChart from '../AreaChart/AreaChart';
import StackedChart from '../StackedChart/StackedChart';
import LineChart from '../LineChart/LineChart';
import * as d3 from 'd3';
import { Layout } from 'antd';
import './container.css';

const { Header, Content, Sider } = Layout;
class Container extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selected: [],
            "covid_19_data": false,
            "time_series_covid_19_confirmed": false,
        }
        this.pan = {};
        this.mapping = {
            ["" + ", South Korea"]: "" + ", Republic of Korea",
            ["UK" + ", UK"]: "" + ", UK",
            ["Hong Kong" + ", Mainland China"]: "Hong Kong" + ", Hong Kong SAR",
            ["" + ", Taiwan"]: "Taiwan" + ", Taipei and environs",
            ["Diamond Princess cruise ship" + ", US"]: "Diamond Princess cruise ship" + ", Others",
            ["Macau" + ", Mainland China"]: "Macau" + ", Macao SAR",
            ["Channel Islands" + ", UK"]: "" + ", Channel Islands",
            ["Gibraltar" + ", UK"]: "" + ", Gibraltar"
        }
        this.dates = ['1/22/20', '1/23/20', '1/24/20', '1/25/20', '1/26/20', '1/27/20', '1/28/20', '1/29/20', '1/30/20', '1/31/20', '2/1/20', '2/2/20', '2/3/20', '2/4/20', '2/5/20', '2/6/20', '2/7/20', '2/8/20', '2/9/20', '2/10/20', '2/11/20', '2/12/20', '2/13/20', '2/14/20', '2/15/20', '2/16/20', '2/17/20', '2/18/20', '2/19/20', '2/20/20', '2/21/20', '2/22/20', '2/23/20', '2/24/20', '2/25/20', '2/26/20', '2/27/20', '2/28/20', '2/29/20', '3/1/20', '3/2/20', '3/3/20', '3/4/20', '3/5/20', '3/6/20', '3/7/20', '3/8/20', '3/9/20', '3/10/20', '3/11/20']
    }

    handleSelection = (s, str) => {
        this.pan.adding = s.length > this.state.selected.length;
        this.pan.selection = str[Math.max(0, str.length - 1)];
        this.setState({ selected: [...str] });
    }

    componentDidMount() {
        d3.csv("./covid/covid_19_data.csv")
            .then((res) => {
                this.covid_19_data = res.map((d) => {
                    return {
                        date: d.ObservationDate,
                        province: d['Province/State'],
                        country: d["Country/Region"],
                        confirmed: Number(d.Confirmed),
                        deaths: Number(d.Deaths),
                        recovered: Number(d.Recovered)
                    };
                });
                this.covid_19_data = this.covid_19_data.map((e) => {
                    let datakey = e.province + ', ' + e.country;
                    datakey = this.mapping[datakey] ? this.mapping[datakey] : datakey;
                    return {
                        ...e,
                        hospitalised: e.confirmed - e.deaths - e.recovered,
                        datakey: datakey
                    };
                });

                this.latestStats = this.covid_19_data.filter((e) => e.date === '03/11/20');
                this.simpleStats = this.latestStats.reduce((acc, e) => {
                    acc.confirmed += e.confirmed;
                    acc.deaths += e.deaths;
                    acc.recovered += e.recovered;
                    acc.hospitalised += e.hospitalised;
                    return acc;
                }, {
                    confirmed: 0,
                    deaths: 0,
                    recovered: 0,
                    hospitalised: 0
                });
                this.setState({ covid_19_data: true });
            });

        d3.csv("./covid/time_series_covid_19_confirmed.csv")
            .then((res) => {
                this.time_series_covid_19_confirmed = res.map((d) => this.processData(d));
                this.setState({ time_series_covid_19_confirmed: true });
            });

        d3.csv("./covid/time_series_covid_19_recovered.csv")
            .then((res) => {
                this.time_series_covid_19_recovered = res.map((d) => this.processData(d));
                this.setState({ time_series_covid_19_recovered: true });
            });

        d3.csv("./covid/time_series_covid_19_deaths.csv")
            .then((res) => {
                this.time_series_covid_19_deaths = res.map((d) => this.processData(d));
                this.setState({ time_series_covid_19_deaths: true });
            });

    }

    processData(d) {
        const data = this.dates.reduce((acc, date) => {
            acc.push({
                date: date,
                value: Number(d[date])
            });
            return acc;
        }, []);

        return {
            province: d['Province/State'],
            country: d["Country/Region"],
            lat: d.Lat,
            long: d.Long,
            data: data
        };
    }
    render() {
        const { covid_19_data,
            time_series_covid_19_confirmed,
            time_series_covid_19_recovered,
            time_series_covid_19_deaths,
            selected } = this.state;
        return (
            <Layout>
                <Sider
                    style={{
                        overflow: 'auto',
                        height: '100vh',
                        position: 'fixed',
                        right: 0,
                    }}
                >
                    {
                        covid_19_data &&
                        <div className="text-box">
                            <div className="vis-block">
                                <span>Total Confirmed</span>
                                <h1>{this.simpleStats.confirmed.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</h1>
                            </div>
                            <div className="vis-block">
                                <span>Total Deaths</span>
                                <h1>{this.simpleStats.deaths.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</h1>
                            </div>
                            <div className="vis-block">
                                <span>Total Recovered</span>
                                <h1>{this.simpleStats.recovered.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</h1>
                            </div>
                            <div className="vis-block">
                                <span>Total Active</span>
                                <h1>{this.simpleStats.hospitalised.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</h1>
                            </div>
                        </div>
                    }
                    {
                        covid_19_data &&
                        <Table data={this.latestStats} handleSelection={this.handleSelection} />
                    }
                </Sider>
                <Layout className="site-layout" >
                    <Header className="site-layout-background" style={{ padding: 0 }} >
                        <h1>Covid-19 DataViz</h1>
                    </Header>
                    <Content style={{ width: '100%', height: '100vh', overflow: 'initial' }}>
                        <br></br>
                        <br></br>
                        {
                            covid_19_data && time_series_covid_19_confirmed &&
                            <Map data={this.latestStats} location={this.time_series_covid_19_confirmed} pan={this.pan} />
                        }
                        <br></br>
                        <br></br>
                        <br></br>
                        <br></br>
                        {
                            time_series_covid_19_recovered && time_series_covid_19_confirmed && time_series_covid_19_deaths &&
                            < StackedChart
                                id="stacked-chart"
                                width="800"
                                height="400"
                                confirmed={this.time_series_covid_19_confirmed}
                                recovered={this.time_series_covid_19_recovered}
                                deaths={this.time_series_covid_19_deaths}
                                y="Cummulated Cases"
                                selected={this.state.selected}
                            />

                        }
                        <div>
                            {
                                time_series_covid_19_confirmed &&
                                <div className="vis-block">
                                    < AreaChart id="confirmed-area-chart"
                                        width="270"
                                        height="400"
                                        data={this.time_series_covid_19_confirmed}
                                        selected={selected}
                                        color="red"
                                        y="Cummulated Confirmed Cases"
                                    />
                                </div>
                            }
                            {
                                time_series_covid_19_deaths &&
                                <div className="vis-block">
                                    < AreaChart id="deaths-area-chart"
                                        width="270"
                                        height="400"
                                        data={this.time_series_covid_19_deaths}
                                        selected={selected}
                                        color="gray"
                                        y="Cummulated Death Cases"
                                    />
                                </div>
                            }
                            {
                                time_series_covid_19_recovered &&
                                <div className="vis-block">
                                    < AreaChart
                                        id="recovered-area-chart"
                                        width="270"
                                        height="400"
                                        data={this.time_series_covid_19_recovered}
                                        selected={selected}
                                        color="lightgreen"
                                        y="Cummulated Recovered Cases"
                                    />
                                </div>
                            }
                        </div>
                    </Content>
                </Layout>
            </Layout>
        )
    }
}

export default Container;