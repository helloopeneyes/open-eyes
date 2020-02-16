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
  display: flex;
  @media (max-width: 600px) {
    flex-direction: column;
    align-items: center;
  }
`;

function colorFromString(str) {
  let val = 0;
  for (const char of Array.from(str)) {
    val += char.charCodeAt(0);
  }
  return `hsl(${val % 360}deg, 70%, 80%)`;
}

const Label = styled(props => {
  return (
    <a {...props} style={{ backgroundColor: colorFromString(props.text) }}>
      {props.children}
    </a>
  );
})`
  color: black;
  text-decoration: none;
  border-radius: 2px;
  font-size: 10pt;
  padding: 0.4em;
  margin-right: 0.2em;
`;

const ItemTitle = styled.h3`
  margin-bottom: 0.4em;
`;

const Item = styled(({ className, item, voteOnItem, deleteVote, filterLabel }) => {
  return (
    <div className={className}>
      <ItemTitle>{item.title}</ItemTitle>
      <div>
        {item.labels.map((label, i) => (
          <Label key={i} text={label} href="#" onClick={() => filterLabel(label)}>
            {label}
          </Label>
        ))}
      </div>
      <p>{item.contents}</p>
      <p>
        {item.upvotes} of {item.totalvotes} people have marked this item as accomplished
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
  margin: 2em 0;
`;

const GlobalStyle = createGlobalStyle`
  html, body {
    margin: 0;
    width: 100%;
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
  padding: 0 1em;
  width: 100%;
  box-sizing: border-box;
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

const Email = styled.span`
  font-size: 10pt;
`;

const Content = styled(Centered)`
  padding: 0 1em;
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
  border-left: 0;
  border-right: 0;
`;

const Labels = styled.div`
  margin: 1em 0;
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
  filterLabel = async label => {
    this.setState(state => {
      if (state.label === label) {
        state.label = null;
      } else {
        state.label = label;
      }
      return state;
    });
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
    const labels = Array.from(
      this.state.items.reduce((acc, item) => {
        for (const label of item.labels) {
          acc.add(label);
        }
        return acc;
      }, new Set())
    );
    const filterItems = item => {
      return !this.state.label || item.labels.includes(this.state.label);
    };
    const renderItem = (item, i) => (
      <Item
        key={i}
        item={item}
        voteOnItem={this.voteOnItem}
        deleteVote={this.deleteVote}
        filterLabel={this.filterLabel}
      />
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
                  <Email title={this.props.email}>{this.props.email}</Email> <a href="/logout">Log out</a>
                </span>
              ) : (
                <a href="/login">Log in</a>
              )}
            </LogIn>
          </Header>
          <Content>
            <Meta>
              <p>{this.state.meta.content}</p>
              <Summary>
                <a href="#needsVotes">Needs Votes</a>: {needsVotes.length} of {this.state.items.length}
              </Summary>
              <Summary>
                <a href="#accomplished">Accomplished</a>: {accomplished.length} of {this.state.items.length}
              </Summary>
              <Summary>
                <a href="#unaccomplished">Unaccomplished</a>: {unAccomplished.length} of {this.state.items.length}
              </Summary>
              <p>
                {Math.floor(formatMonths(new Date(this.state.meta.startDate), new Date()))} months since term started.{" "}
                {Math.ceil(formatMonths(new Date(), new Date(this.state.meta.endDate)))} months remaining.
              </p>
            </Meta>
            <Hr />
            <Labels>
              {labels.map((label, i) => (
                <Label key={i} text={label} href="#" onClick={() => this.filterLabel(label)}>
                  {label}
                  {this.state.label === label ? " x" : ""}
                </Label>
              ))}
            </Labels>
            {!!needsVotes.length && (
              <>
                <h2 id="needsVotes">Needs Votes</h2>
                {needsVotes.filter(filterItems).map(renderItem)}
              </>
            )}
            {!!accomplished.length && (
              <>
                <h2 id="accomplished">Accomplished</h2>
                {accomplished.filter(filterItems).map(renderItem)}
              </>
            )}
            {!!unAccomplished.length && (
              <>
                <h2 id="unaccomplished">Unaccomplished</h2>
                {unAccomplished.filter(filterItems).map(renderItem)}
              </>
            )}
          </Content>
        </Root>
      </ClientContext.Provider>
    );
  }
}
