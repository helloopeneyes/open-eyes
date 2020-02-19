import React from "react";
import styled, { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  html, body {
    margin: 0;
    width: 100%;
  }
`;

export const Centered = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const Root = styled(Centered)`
  font-family: sans-serif;
`;

export const Header = styled.div`
  width: 100%;
  box-sizing: border-box;
  padding: 0 1em;
  text-align: right;
  display: flex;
  align-items: center;
  background: #f2f2f2;
`;

export const Logo = styled(({ className }) => (
  <a className={className} href="/">
    <img src="assets/logo.svg" alt="Open Eyes logo" />
  </a>
))`
  line-height: 0;
  img {
    height: 50px;
  }
`;

export const HeaderLinks = styled(({ className }) => (
  <div className={className}>
    <a href="/">Home</a>
    <a href="/about">About</a>
  </div>
))`
  a {
    margin-left: 1em;
  }
`;

export const Content = styled(Centered)`
  padding: 0 1em;
  width: 100%;
  box-sizing: border-box;
`;
