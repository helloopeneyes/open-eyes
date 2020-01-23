import React, { Component } from "react";
import styled from "styled-components";

const ClientContext = React.createContext(false);

const SkeletonButton = styled.span`
  display: inline-block;
  width: 150px;
  height: 30px;
  ${props => (props.as === "button" ? "" : "background-color: #eee;")}
`;

const SimpleButton = styled(SkeletonButton)`
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
`;

const Button = styled(({ className, children, onClick }) => {
  return (
    <ClientContext.Consumer>
      {isClient => (
        <div className={className}>
          {isClient ? (
            <SimpleButton as="button" onClick={onClick}>
              {children}
            </SimpleButton>
          ) : (
            <SkeletonButton />
          )}
        </div>
      )}
    </ClientContext.Consumer>
  );
})`
  display: inline;
  margin: 0 0.5em;
`;

const ControlContainer = styled.div`
  height: 2em;
  display: flex;
`;

export default class Main extends Component {
  state = { items: [], isClient: false };
  constructor(props) {
    super(props);
    this.state.items = props.items || [];
  }
  componentDidMount() {
    this.setState({ isClient: true });
  }
  async voteOnItem(name) {
    await fetch(`/api/votes/${name}`, { method: "post" });
    this.setState({ items: await fetch("/api/items").then(r => r.json()) });
  }
  render() {
    const { isClient } = this.state;
    return (
      <ClientContext.Provider value={isClient}>
        {this.state.items.map((item, i) => (
          <div key={i}>
            <pre>{item.contents}</pre>
            <div>{item.votes}</div>
            <ControlContainer>
              <Button onClick={() => this.voteOnItem(item.name)}>accomplished</Button>
              <Button>unaccomplished</Button>
            </ControlContainer>
          </div>
        ))}
      </ClientContext.Provider>
    );
  }
}
