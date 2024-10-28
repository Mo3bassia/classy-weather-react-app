import React from "react";

function getWeatherIcon(wmoCode) {
  const icons = new Map([
    [[0], "☀️"],
    [[1], "🌤"],
    [[2], "⛅️"],
    [[3], "☁️"],
    [[45, 48], "🌫"],
    [[51, 56, 61, 66, 80], "🌦"],
    [[53, 55, 63, 65, 57, 67, 81, 82], "🌧"],
    [[71, 73, 75, 77, 85, 86], "🌨"],
    [[95], "🌩"],
    [[96, 99], "⛈"],
  ]);
  const arr = [...icons.keys()].find((key) => key.includes(wmoCode));
  if (!arr) return "NOT FOUND";
  return icons.get(arr);
}

function convertToFlag(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

function formatDay(dateStr) {
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
  }).format(new Date(dateStr));
}

export default class App extends React.Component {
  state = {
    location: "",
    isLoading: false,
    displayLocation: "",
    weather: {},
  };

  componentDidMount = () => {
    if (localStorage.getItem("location")) {
      this.setState({ location: localStorage.getItem("location") });
      this.fetchingData();
    }
  };

  componentDidUpdate = (prevProps, prevState) => {
    if (prevState.location !== this.state.location) {
      localStorage.setItem("location", this.state.location);
      this.fetchingData();
    }
  };

  fetchingData = async () => {
    try {
      // 1) Getting location (geocoding)
      this.setState({ isLoading: true });
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${this.state.location}`
      );
      const geoData = await geoRes.json();
      // console.log(geoData);

      if (!geoData.results) throw new Error("Location not found");

      const { latitude, longitude, timezone, name, country_code } =
        geoData.results.at(0);
      this.setState({
        displayLocation: `${name} ${convertToFlag(country_code)}`,
      });

      // 2) Getting actual weather
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&timezone=${timezone}&daily=weathercode,temperature_2m_max,temperature_2m_min`
      );
      const weatherData = await weatherRes.json();
      this.setState({ weather: weatherData.daily });
    } catch (err) {
      console.error(err);
    } finally {
      // console.log(this.state.isLoading);
      this.setState({ isLoading: false });
    }
  };

  render() {
    return (
      <div className="app">
        <h1>Classy Weather</h1>
        <div>
          <input
            placeholder="Search for location..."
            value={this.state.location}
            onChange={(e) => this.setState({ location: e.target.value })}
          ></input>
        </div>
        {this.state.isLoading && <p className="loader">Loading...</p>}

        {Object.keys(this.state.weather).length > 0 && (
          <Weather
            weather={this.state.weather}
            displayLocation={this.state.displayLocation}
          />
        )}
      </div>
    );
  }
}

class Weather extends React.Component {
  render() {
    const {
      temperature_2m_max: max,
      temperature_2m_min: min,
      time: dates,
      weathercode: codes,
    } = this.props.weather;
    return (
      <div>
        <h2>Weather {this.props.displayLocation}</h2>
        <ul className="weather">
          {dates.map((date, index) => (
            <Day
              key={date}
              date={date}
              max={max[index]}
              min={min[index]}
              codes={codes[index]}
              isToday={index === 0}
            />
          ))}
        </ul>
      </div>
    );
  }
}

class Day extends React.Component {
  render() {
    const { max, min, codes, date, isToday } = this.props;
    return (
      <li className="day">
        <span>{getWeatherIcon(codes)}</span>
        <p>{isToday ? <strong>Today</strong> : formatDay(date)}</p>
        <p>
          {Math.floor(min)}° - <strong>{Math.ceil(max)}°</strong>
        </p>
      </li>
    );
  }
}
