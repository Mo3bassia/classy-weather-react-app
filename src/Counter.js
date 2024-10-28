import React, { useState } from "react";

export default class Counter extends React.Component {
  constructor(props) {
    super(props);
    this.state = { count: 1 };
    this.handleDecrement = this.handleDecrement.bind(this);
    this.handleIncrement = this.handleIncrement.bind(this);
  }

  handleDecrement() {
    this.setState((c) => {
      return { count: c.count - 1 };
    });
  }
  handleIncrement = () => {
    this.setState((c) => {
      return { count: c.count + 1 };
    });
  };

  render() {
    const date = new Date("10-27-2028");
    date.setDate(date.getDate() + this.state.count);

    return (
      <div>
        <button onClick={this.handleDecrement}>-</button>{" "}
        <span>
          {date.toLocaleDateString()} {this.state.count}
        </span>{" "}
        <button onClick={this.handleIncrement}>+</button>
      </div>
    );
  }
}
