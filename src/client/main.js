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

const Button = styled(({ className, children, disabled, onClick }) => {
  return (
    <ClientContext.Consumer>
      {isClient => (
        <div className={className}>
          {isClient ? (
            <SimpleButton as="button" onClick={onClick} disabled={disabled}>
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

const Item = styled(({ className, item, voteOnItem, deleteVote }) => {
  return (
    <div className={className}>
      <pre>{item.contents}</pre>
      <p>
        {item.upvotes} of {item.totalvotes} users have marked this item as accomplished
      </p>
      <ControlContainer>
        <Button onClick={() => voteOnItem(item.name, true)} disabled={item.userVote.upvote === 1}>
          accomplished
        </Button>
        <Button onClick={() => voteOnItem(item.name, false)} disabled={item.userVote.upvote === 0}>
          unaccomplished
        </Button>
        <Button onClick={() => deleteVote(item.name)} disabled={item.userVote.upvote === null}>
          remove vote
        </Button>
      </ControlContainer>
    </div>
  );
})``;

const Summary = styled.p`
  font-size: 20pt;
  font-weight: bold;
`;

const MIN_VOTES = 3;

export default class Main extends Component {
  state = { items: [], isClient: false };
  constructor(props) {
    super(props);
    this.state.items = props.items || [];
  }
  componentDidMount() {
    this.setState({ isClient: true });
  }
  voteOnItem = async (name, upvote) => {
    await fetch(`/api/votes/${name}`, {
      method: "post",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ upvote })
    });
    this.setState({ items: await fetch("/api/items").then(r => r.json()) });
  };
  deleteVote = async name => {
    await fetch(`/api/votes/${name}`, { method: "delete" });
    this.setState({ items: await fetch("/api/items").then(r => r.json()) });
  };
  render() {
    const { isClient } = this.state;
    const accomplished = this.state.items.filter(
      item => item.totalvotes >= MIN_VOTES && item.upvotes / item.totalvotes >= 0.5
    );
    const unAccomplished = this.state.items.filter(
      item => item.totalvotes >= MIN_VOTES && item.upvotes / item.totalvotes < 0.5
    );
    const needsVotes = this.state.items.filter(item => item.totalvotes < MIN_VOTES);
    const renderItem = (item, i) => (
      <Item key={i} item={item} voteOnItem={this.voteOnItem} deleteVote={this.deleteVote} />
    );
    return (
      <ClientContext.Provider value={isClient}>
        {this.props.email ? (
          <div>
            Logged in as {this.props.email}. <a href="/logout">Log out</a>
          </div>
        ) : (
          <a href="/login">Log in</a>
        )}
        <Summary>
          Accomplished {accomplished.length} of {this.state.items.length}
        </Summary>
        <h2>Accomplished</h2>
        {accomplished.map(renderItem)}
        <h2>Unaccomplished</h2>
        {unAccomplished.map(renderItem)}
        <h2>Needs Votes</h2>
        {needsVotes.map(renderItem)}
      </ClientContext.Provider>
    );
  }
}
