import React, { Component } from "react";

export default class Main extends Component {
  render() {
    return this.props.items.map((f, i) => <div key={i}>
      <pre>{f.contents}</pre>
      <button>accomplished</button>
      <button>unaccomplished</button>
      </div>);
  }
}
