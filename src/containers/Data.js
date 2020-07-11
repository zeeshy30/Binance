import React, { Component } from 'react';
import axios from 'axios';
import _ from 'lodash';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import { AmChartsLogo } from '@amcharts/amcharts4/.internal/core/elements/AmChartsLogo';

const URL = 'ws://localhost:3030';

export default class Data extends Component {
    ws = new WebSocket(URL);

    componentDidMount() {
        this.ws.onclose = () => {
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

    // repeatEvery(func) {
    //     const interval = 60 * 1000;

    //     const now = new Date();
    //     now.setSeconds(now.getSeconds());
    //     const delay = interval - now % interval;

    //     function start() {
    //         func();
    //         setInterval(func, interval);
    //     }
    //     setTimeout(start, delay);
    // }

    graph = giveData => {
        am4core.useTheme(am4themes_animated);

        const chart = am4core.create("chartdiv", am4charts.XYChart)
        am4core.ready(() => {
            chart.paddingRight = 20;
            chart.dateFormatter.inputDateFormat = "dd/MM/yyyy HH:mm";

            var dateAxis = chart.xAxes.push(new am4charts.DateAxis());
            dateAxis.renderer.grid.template.location = 0;

            var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
            valueAxis.tooltip.disabled = true;

            var series = chart.series.push(new am4charts.CandlestickSeries());
            series.dropFromOpenState.properties.fill = am4core.color("#0022ff");
            series.dropFromOpenState.properties.stroke = am4core.color("#0022ff");

            series.riseFromOpenState.properties.fill = am4core.color("#ff2211");
            series.riseFromOpenState.properties.stroke = am4core.color("#ff2211");
            series.dataFields.dateX = "time";
            series.dataFields.valueY = "close";
            series.dataFields.openValueY = "open";
            series.dataFields.lowValueY = "low";
            series.dataFields.highValueY = "high";
            series.simplifiedProcessing = true;
            series.tooltipText = "Open:${openValueY.value}\nLow:${lowValueY.value}\nHigh:${highValueY.value}\nClose:${valueY.value}";
            // series.zIndex = 1;

            chart.cursor = new am4charts.XYCursor();

            var lineSeries = chart.series.push(new am4charts.LineSeries());
            lineSeries.dataFields.dateX = "time";
            lineSeries.dataFields.valueY = "lastOpenPrice";
            lineSeries.defaultState.properties.visible = true;
            lineSeries.stroke = am4core.color("#999");

            var lineSeriesPlus2 = chart.series.push(new am4charts.LineSeries());
            lineSeriesPlus2.dataFields.dateX = "time";
            lineSeriesPlus2.dataFields.valueY = "lastOpenPricePlus2";
            lineSeriesPlus2.defaultState.properties.visible = true;
            lineSeriesPlus2.stroke = am4core.color("#f00");

            var lineSeriesMinus2 = chart.series.push(new am4charts.LineSeries());
            lineSeriesMinus2.dataFields.dateX = "time";
            lineSeriesMinus2.dataFields.valueY = "lastOpenPriceMinus2";
            lineSeriesMinus2.defaultState.properties.visible = true;
            lineSeriesMinus2.stroke = am4core.color("#00f");


            var currentPrice = chart.series.push(new am4charts.LineSeries());
            currentPrice.dataFields.dateX = "time";
            currentPrice.dataFields.valueY = "currentPrice";
            currentPrice.defaultState.properties.visible = true;

            var bullet = currentPrice.bullets.push(new am4charts.Bullet());
            var square = bullet.createChild(am4core.Rectangle);
            square.height = 15;
            square.width = 80;
            square.verticalCenter = "middle";

            var valueLabel = currentPrice.bullets.push(new am4charts.LabelBullet());
            valueLabel.label.text = "{currentPrice}";
            valueLabel.label.fontSize = 15;
            valueLabel.label.fill = am4core.color("#fff");
            valueLabel.label.horizontalCenter = 'left'

            chart.data = giveData;
            // function addData(fetchData) {
            //     fetchData().then(fetchedData => {
            //         chart.addData(fetchedData[fetchedData.length - 1]);
            //         chart.data.forEach((item, index) => {
            //             chart.data[index]["lastOpenPricePlus2"] = fetchedData[fetchedData.length - 1]["lastOpenPricePlus2"];
            //             chart.data[index]["lastOpenPriceMinus2"] = fetchedData[fetchedData.length - 1]["lastOpenPriceMinus2"];
            //             chart.data[index]["lastOpenPrice"] = fetchedData[fetchedData.length - 1]["lastOpenPrice"];
            //         });
            //         chart.invalidateRawData();
            //     });
            // };

            valueLabel.disabled = true;
            valueLabel.propertyFields.disabled = "disabled";
            bullet.disabled = true;
            bullet.propertyFields.disabled = "disabled";
            const updateCurrentPrice = async price => {
                const dataLength = chart.data.length;
                if (chart.data.length) {
                    chart.data[0].disabled = false;
                    var ts = Math.round((new Date()).getTime());
                    if (this.convertToMinutes(ts) === chart.data[dataLength - 1]["time"]) {
                        console.log(chart.data[dataLength - 1]["high"]);
                        if (chart.data[dataLength - 1]["high"] < price)
                            chart.data[dataLength - 1]["high"] = price;
                        if (chart.data[dataLength - 1]["low"] > price)
                            chart.data[dataLength - 1]["low"] = price;
                        chart.data[dataLength - 1]["close"] = price;
                        if (chart.data[dataLength - 1]["open"] < price) {
                            currentPrice.stroke = am4core.color("#c00");
                            currentPrice.fill = am4core.color("#c00");

                        } else {
                            currentPrice.stroke = am4core.color("#00c");
                            currentPrice.fill = am4core.color("#00c");
                        }
                    } else {
                        const newData = {
                            time: this.convertToMinutes(ts),
                            open: price,
                            high: price,
                            low: price,
                            close: price,
                            lastOpenPrice: price,
                            lastOpenPricePlus2: price + 2,
                            lastOpenPriceMinus2: price - 2,
                        };
                        chart.addData(newData);
                        chart.data.forEach((item, index) => {
                            chart.data[index]["lastOpenPrice"] = price;
                            chart.data[index]["lastOpenPricePlus2"] = price + 2;
                            chart.data[index]["lastOpenPriceMinus2"] = price - 2;
                        });
                    }
                }
                chart.data.forEach((item, index) => {
                    chart.data[index]["currentPrice"] = price;
                });
                chart.invalidateRawData();
            }

            this.ws.onmessage = evt => {
                const price = JSON.parse(evt.data);
                updateCurrentPrice(price);
            }

            // this.repeatEvery(() => { addData(this.fetchData) });
        });
    }



    convertToMinutes = timestamp => {
        const date = new Date(parseInt(timestamp));
        const day = '0' + date.getDate();
        const month = '0' + (date.getMonth() + 1);
        const year = date.getFullYear();
        const hours = '0' + date.getHours();
        const minutes = "0" + date.getMinutes();
        return `${year}/${month.substr(-2)}/${day.substr(-2)} ${hours.substr(-2)}:${minutes.substr(-2)}`;
    }

    formatData = data => {
        const allTimes = Object.keys(data);
        let length = allTimes.length;
        // var ts = Math.round((new Date()).getTime());
        if (length === 0)
            return [];

        // if (allTimes[length - 1] === this.convertToMinutes(ts)) {
        //     allTimes.pop();
        //     length--;
        //     if (length === 0)
        //         return [];
        // }

        const lastOpenPrice = data[allTimes[length - 1]][0];

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