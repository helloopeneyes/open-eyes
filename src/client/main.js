import React, { Component } from "react";
import styled, { createGlobalStyle } from "styled-components";

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

const Label = styled.a`
  border: 1px solid black;
`;

const ItemTitle = styled.h3`
  display: inline;
`;

const Item = styled(({ className, item, voteOnItem, deleteVote }) => {
  return (
    <div className={className}>
      <ItemTitle>{item.title}</ItemTitle>
      {item.labels.map((label, i) => (
        <Label key={i}>{label}</Label>
      ))}
      <p>{item.contents}</p>
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
})`
  margin: 1em 0;
`;

const GlobalStyle = createGlobalStyle`
  html, body {
    margin: 0;
  }
`;

const Centered = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Root = styled(Centered)`
  font-family: sans-serif;
`;

const Header = styled.div`
  width: 100%;
  text-align: right;
  display: flex;
  align-items: center;
  background: #f2f2f2;
`;

const Logo = styled.img`
  height: 50px;
`;

const LogIn = styled.span`
  flex: 1;
`;

const Meta = styled(Centered)`
  margin: 1em 0;
`;

const Summary = styled.p`
  font-size: 20pt;
  font-weight: bold;
`;

const Hr = styled.hr`
  width: 100%;
`;

const MIN_VOTES = 3;

export default class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    Object.assign(this.state, props);
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
    const formatMonths = (start, end) => {
      return Math.floor((end - start) / 1000 / 60 / 60 / 24 / 30);
    };
    return (
      <ClientContext.Provider value={isClient}>
        <GlobalStyle />
        <Root>
          <Header>
            <Logo src="assets/logo.svg" alt="Open Eyes logo" />
            <LogIn>
              {this.props.email ? (
                <span>
                  Logged in as {this.props.email}. <a href="/logout">Log out</a>
                </span>
              ) : (
                <a href="/login">Log in</a>
              )}
            </LogIn>
          </Header>
          <Meta>
            <p>{this.state.meta.content}</p>
            <Summary>
              Accomplished {accomplished.length} of {this.state.items.length}
            </Summary>
            <p>
              {Math.floor(formatMonths(new Date(this.state.meta.startDate), new Date()))} months since term started.{" "}
              {Math.ceil(formatMonths(new Date(), new Date(this.state.meta.endDate)))} months remaining.
            </p>
          </Meta>
          <Hr />
          {!!needsVotes.length && (
            <>
              <h2>Needs Votes</h2>
              {needsVotes.map(renderItem)}
            </>
          )}
          {!!accomplished.length && (
            <>
              <h2>Accomplished</h2>
              {accomplished.map(renderItem)}
            </>
          )}
          {!!unAccomplished.length && (
            <>
              <h2>Unaccomplished</h2>
              {unAccomplished.map(renderItem)}
            </>
          )}
        </Root>
      </ClientContext.Provider>
    );
  }
}
