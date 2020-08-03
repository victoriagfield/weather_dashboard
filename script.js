/*Global Variable for API key and queryURL*/
var APIKey = "&appid=f6940ed9495c99e1100a5a35b467b0c6";
var queryURL = "http://api.openweathermap.org/data/2.5/weather?q=";

/*Search a City section*/
$(document).ready(function () {
  $("#search-button").on("click", function () {
    var searchValue = $("#search-value").val();

    // clear input box
    $("#search-value").val("");


    searchWeather(searchValue);
  });

  $(".history").on("click", "li", function () {
    searchWeather($(this).text());
  });

  function makeRow(text) {
    var li = $("<li>").addClass("list-group-item list-group-item-action").text(text);
    $(".history").append(li);
  }

  //Current Weather Section
  function searchWeather(searchValue) {

    /*empty text that allows the city name and current uv to change instead of appending when a new city is searched*/
    $("#cityName").text(" ");
    $("#currentUV").text(" ");

    $.ajax({
      url: queryURL + searchValue + APIKey,
      method: "GET",
      dataType: "json",
      success: function (data) {
        console.log(data)
        // create history link for this search
        if (history.indexOf(searchValue) === -1) {
          history.push(searchValue);
          window.localStorage.setItem("history", JSON.stringify(history));

          makeRow(searchValue);
        }


        //Current Weather Section - calling the data types
        var tempF = (data.main.temp - 273.15) * 1.80 + 32;

        $("#currentIcon").html("<img src='http://openweathermap.org/img/w/" + data.weather[0].icon + ".png'>");
        $("#cityName").append("City Name: " + data.name);
        $("#currentDay").text(moment().format("dddd, MMMM Do"));
        $("#currentTempF").text("Temperature: " + tempF.toFixed(2) + " °");
        $("#currentHumidity").text("Humidity: " + data.main.humidity + "%");
        $("#currentWind").text("Wind Speed: " + data.wind.speed + " m/s");
      
        // call follow-up api endpoints
        getForecast(searchValue);
        getUVIndex(data.coord.lat, data.coord.lon);
      }
    });
  }

  //Global variable for 5 day forecast
  var fiveDayForecast = "http://api.openweathermap.org/data/2.5/forecast?q="

  //5 day forecast section
  function getForecast(searchValue) {

    $.ajax({
      url: fiveDayForecast + searchValue + APIKey,
      method: "GET",
      dataType: "json",
      success: function (data) {

        console.log(data)
        //empties the five day row before the next city is clicked
        $("#FiveDayRow").empty();

        // loop over all forecasts (by 3-hour increments)
        for (var i = 0; i < data.list.length; i++) {
          // only look at forecasts around 3:00pm
          if (data.list[i].dt_txt.indexOf("15:00:00") !== -1) {

            //html elements for a bootstrap card
            var tempF = (data.list[i].main.temp - 273.15) * 1.80 + 32;
            var humid = (data.list[i].main.humidity);
            var uvIndex = (data.value);
            var img = $("<img>").attr("src", "http://openweathermap.org/img/w/" + data.list[i].weather[0].icon + ".png");
            var col = $("<div>").addClass('col-lg-2 card-wrapper');
            var card = $("<div>").addClass("card");
            var cardHeader = $("<div>").addClass("card-header");
            cardHeader.text(new Date(data.list[i].dt_txt).toLocaleDateString());
            var cardBody = $("<div>").addClass("cardBody");
            cardBody.html("<strong>" + tempF.toFixed(2) + " °F" + "</strong>" + "<br>" + "Humidity: " + humid + "%" + "<br>");

            //CSS for card body
            cardHeader.css("background", "#3E8AC1").css("color", "white").css("fontWeight", "bold");
            cardBody.css("backgroundImage", "url(../assets/shutterstock_1562129317.jpg)").css("color", "#2D638A");
            img.css("width", "25%");


            // merge together and put on page
            card.append(cardHeader, img, cardBody);
            col.append(card);
            $("#FiveDayRow").append(col)

          }
        }
      }
    });
  }


  //uv index function
  function getUVIndex(lat, lon) {
    var uvUrl = `http://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}${APIKey}`

    $.ajax({
      type: "GET",
      url: uvUrl,
      dataType: "json",
      success: function (data) {

        //UV Value and Button for current weather section
        var uv = $("<p>").text("UV Index: ");
        var btn = $("<span>").addClass("btn btn-sm").text(data.value);

        //changes CSS values for UV Index button
        btn.css("fontWeight", "bold").css("fontSize", "18px");

        // changes color depending on uv value
        if (btn <= 3) {
          btn.css("background", "green").css("color", "black");
        }
        else if (btn >= 3 || btn <= 6) {
          btn.css("background", "yellow").css("color", "black");
        }
        else if (btn >= 6 || btn <= 8) {
          btn.css("background", "orange").css("color", "black");
        }
        else {
          btn.css("background", "red").css("color", "black");
        }

        //appending uv button and index into the currentUV div
        $("#currentUV").append(uv.append(btn));
      }
    });

  }

  // get current history, if any
  var history = JSON.parse(window.localStorage.getItem("history")) || [];

  if (history.length > 0) {
    searchWeather(history[history.length - 1]);
  }

  for (var i = 0; i < history.length; i++) {
    makeRow(history[i]);
  }



});
