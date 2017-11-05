var request = require("request");
var rp = require('request-promise');
var cheerio = require("cheerio");
var cron = require('node-cron');
// var say = require('say');
var date = require('date-and-time');
const notifier = require('node-notifier');
var say = require('say');

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

    Promise.all([bci, zeb, coinbase])
        .then(values => {
            console.log(FgBlue, "bcibuy: ", bciBuy, "  bciSell: ", bciSell);
            console.log(FgGreen, "zebBuy:  ", zebBuy, "  zebsell:  ", zebsell);
            console.log(FgYellow, "coinbaseBuy: ", coinbaseBuy);
            console.log(Reset, "----------------------------------");
            
            notifier.notify({
                'title': "bci: " + bciBuy+","+bciSell,
                'subtitle':"zeb:  "+zebBuy+","+zebsell,
                'message': "coi:  " + coinbaseBuy
            });
        });

});
