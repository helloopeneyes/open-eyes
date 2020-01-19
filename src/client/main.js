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
  state = {
    counter: 0
  };
  componentDidMount() {
    this.setState({ isClient: true });
  }
  render() {
    const { isClient, counter } = this.state;
    return (
      <ClientContext.Provider value={isClient}>
        <span>{counter}</span>
        {this.props.items.map((f, i) => (
          <div key={i}>
            <pre>{f.contents}</pre>
            <ControlContainer>
              <Button onClick={() => this.setState(state => ({ counter: state.counter + 1 }))}>accomplished</Button>
              <Button>unaccomplished</Button>
            </ControlContainer>
          </div>
        ))}
      </ClientContext.Provider>
    );
  }
}
