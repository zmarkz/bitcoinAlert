var request = require("request");
var rp = require('request-promise');
var cheerio = require("cheerio");
var cron = require('node-cron');
// var say = require('say');
var date = require('date-and-time');
const notifier = require('node-notifier');
var say = require('say');

var blessed = require('blessed');
var contrib = require('blessed-contrib');
var screen = blessed.screen();

var FgGreen = "\x1b[32m";
var FgYellow = "\x1b[33m";
var FgBlue = "\x1b[34m";
var FgWhite = "\x1b[37m";
var Reset = "\x1b[0m";

console.log("Starting bitCoinIndia");
var optionsBitCoinIndia = {
    uri: "https://bitcoin-india.org/",
    transform: function (body) {
        return cheerio.load(body);
    }
};

var optionsZebPay = {
    uri: "https://api.zebpay.com/api/v1/ticker?currencyCode=INR",
    json: true
};

var optionsCoinbase = {
    uri: "https://api.coinbase.com/v2/prices/spot?currency=INR",
    json: true
};
var bciBuyArr = new Array();
var bciSellArr = new Array();
var zebBuyArr = new Array();
var zebSellArr = new Array();
var coiBuyArr = new Array();
var x = new Array();
cron.schedule('*/10 * * * * *', function(){


    var bciBuy, bciSell, zebBuy, zebsell, coinbaseBuy;
    var bci = rp(optionsBitCoinIndia)
        .then(function ($) {
            bciBuy = $("#buyvalue").html();
            bciSell = $("#sellvalue").html();
        })
        .catch(function (err) {
            console.log("error occured");
        });

    var zeb =  rp(optionsZebPay)
        .then(function (obj) {
            zebBuy = obj.buy;
            zebsell = obj.sell;
        })
        .catch(function (err) {
            console.log("error occured");
        });

    var coinbase =  rp(optionsCoinbase)
        .then(function (obj) {
            coinbaseBuy = obj.data.amount;
        })
        .catch(function (err) {
            console.log("error occured");
        });

    var line = contrib.line(
        { style:
            { line: "yellow"
                , text: "green"
                , baseline: "black"}
            , xLabelPadding: 10
            , xPadding: 10
            , showLegend: true
            , wholeNumbersOnly: false //true=do not show fraction in y axis
            , label: 'Title'});

    Promise.all([bci, zeb, coinbase])
        .then(values => {

            bciBuyArr.push(parseInt(bciBuy/1000));
            bciSellArr.push(parseInt(bciSell/1000));
            zebBuyArr.push(parseInt(zebBuy/1000));
            zebSellArr.push(parseInt(zebsell/1000));
            coiBuyArr.push(parseInt(coinbaseBuy/1000));

            var time = new Date().getTime();
            x.push(time);


            var bciBuySeries = {
                title: 'bci-buy',
                x: x,
                y: bciBuyArr,
                style: {
                    line: "red"
                }

            };
            var bciSellSeries = {
                title: 'bci-sell',
                x: x,
                y: bciSellArr,
                style: {
                    line: "yellow"
                }
            };


            var zebBuySeries = {
                title: 'zeb-buy',
                x: x,
                y: zebBuyArr,
                style: {
                    line: "green"
                }

            };
            var zebSellSeries = {
                title: 'zeb-sell',
                x: x,
                y: zebSellArr,
                style: {
                    line: "blue"
                }
            };

            var coiBuySeries = {
                title: 'coi-buy',
                x: x,
                y: coiBuyArr,
                style: {
                    line: "black"
                }

            };

            screen.append(line) ;//must append before setting data
            line.setData([bciBuySeries,bciSellSeries,zebBuySeries,zebSellSeries,coiBuySeries]);

            screen.key(['escape', 'q', 'C-c'], function(ch, key) {
                return process.exit(0);
            });

            screen.render()

            console.log(FgBlue, "bcibuy: ", bciBuy, "  bciSell: ", bciSell);
            console.log(FgGreen, "zebBuy:  ", zebBuy, "  zebsell:  ", zebsell);
            console.log(FgYellow, "coinbaseBuy: ", coinbaseBuy);
            console.log(Reset, "----------------------------------");
            // if(bciBuy < 494000) {
            //     say.speak("alert: buy");
            // }
            notifier.notify({
                'title': "bci: " + bciBuy+","+bciSell,
                'subtitle':"zeb:  "+zebBuy+","+zebsell,
                'message': "coi:  " + coinbaseBuy
            });
        });

});
