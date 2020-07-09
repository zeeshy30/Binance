import React, { Component } from 'react';
import axios from 'axios';
import _ from 'lodash';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

const URL = 'ws://localhost:3030';

export default class Data extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // chart: ,
            res: [],
            ws: new WebSocket(URL)
        }
    }


    componentDidMount() {
        this.state.ws.onclose = () => {
            // automatically try to reconnect on connection loss
            this.setState({
                ws: new WebSocket(URL),
            })
        }
        const dataPromise = this.fetchData()
        dataPromise.then(data => {
            this.graph(data);
        });
    }

    repeatEvery(func) {
        const interval = 60 * 1000;

        const now = new Date();
        now.setSeconds(now.getSeconds() - 5);
        const delay = interval - now % interval;

        function start() {
            func();
            setInterval(func, interval);
        }
        setTimeout(start, delay);
    }

    graph = giveData => {
        am4core.useTheme(am4themes_animated);
        // Themes end
        const chart = am4core.create("chartdiv", am4charts.XYChart)
        am4core.ready(() => {
            chart.paddingRight = 20;
            chart.dateFormatter.inputDateFormat = "dd/MM/yyyy HH:mm";

            var dateAxis = chart.xAxes.push(new am4charts.DateAxis());
            dateAxis.renderer.grid.template.location = 0;

            var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
            valueAxis.tooltip.disabled = true;

            var series = chart.series.push(new am4charts.CandlestickSeries());
            series.dropFromOpenState.properties.fill = am4core.color("#ff2211");
            series.dropFromOpenState.properties.stroke = am4core.color("#ff2211");

            series.riseFromOpenState.properties.fill = am4core.color("#0022ff");
            series.riseFromOpenState.properties.stroke = am4core.color("#0022ff");
            series.dataFields.dateX = "time";
            series.dataFields.valueY = "close";
            series.dataFields.openValueY = "open";
            series.dataFields.lowValueY = "low";
            series.dataFields.highValueY = "high";
            series.simplifiedProcessing = true;
            series.tooltipText = "Open:${openValueY.value}\nLow:${lowValueY.value}\nHigh:${highValueY.value}\nClose:${valueY.value}";

            chart.cursor = new am4charts.XYCursor();

            // a separate series for scrollbar
            var lineSeries = chart.series.push(new am4charts.LineSeries());
            lineSeries.dataFields.dateX = "time";
            lineSeries.dataFields.valueY = "lastOpenPrice";
            // need to set on default state, as initially series is "show"
            lineSeries.defaultState.properties.visible = true;
            lineSeries.stroke = am4core.color("#999");

            var lineSeriesPlus2 = chart.series.push(new am4charts.LineSeries());
            lineSeriesPlus2.dataFields.dateX = "time";
            lineSeriesPlus2.dataFields.valueY = "lastOpenPricePlus2";
            // need to set on default state, as initially series is "show"
            lineSeriesPlus2.defaultState.properties.visible = true;
            lineSeriesPlus2.stroke = am4core.color("#f00");

            var lineSeriesMinus2 = chart.series.push(new am4charts.LineSeries());
            lineSeriesMinus2.dataFields.dateX = "time";
            lineSeriesMinus2.dataFields.valueY = "lastOpenPriceMinus2";
            // need to set on default state, as initially series is "show"
            lineSeriesMinus2.defaultState.properties.visible = true;
            lineSeriesMinus2.stroke = am4core.color("#00f");


            var currentPrice = chart.series.push(new am4charts.LineSeries());
            currentPrice.dataFields.dateX = "time";
            currentPrice.dataFields.valueY = "currentPrice";
            // need to set on default state, as initially series is "show"
            currentPrice.defaultState.properties.visible = true;
            currentPrice.stroke = am4core.color("#900");
            // currentPrice.name = "Price";

            // var scrollbarX = new am4charts.XYChartScrollbar();
            // scrollbarX.series.push(lineSeries);
            // chart.scrollbarX = scrollbarX;

            chart.data = giveData;
            function addData(fetchData) {
                fetchData().then(fetchedData => {
                    chart.addData(fetchedData[fetchedData.length - 1]);
                    chart.data.forEach((item, index) => {
                        chart.data[index]["lastOpenPricePlus2"] = fetchedData[fetchedData.length - 1]["lastOpenPricePlus2"];
                        chart.data[index]["lastOpenPriceMinus2"] = fetchedData[fetchedData.length - 1]["lastOpenPriceMinus2"];
                        chart.data[index]["lastOpenPrice"] = fetchedData[fetchedData.length - 1]["lastOpenPrice"];
                    });
                    chart.invalidateRawData();
                });
            };
            async function updateCurrentPrice (price) {
                chart.data.forEach((item, index) => {
                    chart.data[index]["currentPrice"] = price;
                });
                chart.invalidateRawData();
            }

            this.state.ws.onmessage = evt => {
                const price = JSON.parse(evt.data);
                updateCurrentPrice(price);
            }
            // setInterval(changeCurrentPrice, 800);
            this.repeatEvery(() => { addData(this.fetchData) });
        });
    }



    convertToMinutes = timestamp => {
        const date = new Date(parseInt(timestamp));
        const day = '0' + date.getDate();
        const month = '0' + (date.getMonth() + 1);
        const year = date.getFullYear();
        const hours = '0' + date.getHours();
        const minutes = "0" + date.getMinutes();
        return `${year}/${month.substr(-2)}/${day.substr(-2)} ${hours}:${minutes.substr(-2)}`;
    }

    formatData = data => {
        const allTimes = Object.keys(data);
        const length = allTimes.length;
        if (length < 1)
            return;
        const lastOpenPrice = data[allTimes[length - 2]][0];
        allTimes.pop();
        return allTimes.map(time => {
            const prices = data[time];
            return {
                time: time,
                open: prices[0],
                high: Math.max.apply(null, prices),
                low: Math.min.apply(null, prices),
                close: prices[prices.length - 1],
                lastOpenPrice,
                lastOpenPricePlus2: lastOpenPrice + 2,
                lastOpenPriceMinus2: lastOpenPrice - 2,
                currentPrice: lastOpenPrice,
            }
        });
    }

    mapTimeToPrice = data => {
        return _.mapValues(_.groupBy(data, 'eventTime'),
            clist => clist.map(data => {
                const pricesJson = _.omit(data, 'eventTime');
                return pricesJson['price'];
            }));
    }

    fetchData = async () => {
        return await axios.get('http://localhost:3001/api/trade-data').then(res => {
            const withDateTime = res.data.map(data => {
                return {
                    eventTime: this.convertToMinutes(data.eventTime),
                    price: data.price,
                }
            });
            return this.formatData(this.mapTimeToPrice(withDateTime));
        }).catch(err => {
            alert(err);
        });
    }


    render() {
        return <div id="chartdiv" style={{ width: '100%', height: 600 }} />
    }
}