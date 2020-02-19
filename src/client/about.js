import React from "react";
import styled from "styled-components";

import { GlobalStyle, Centered, Root, Header, Logo, HeaderLinks, Content } from "./components.js";

const AboutContent = styled(Centered)`
  max-width: 600px;
`;

export default function About() {
  return (
    <Root>
      <GlobalStyle />
      <Header>
        <Logo />
        <HeaderLinks />
      </Header>
      <Content>
        <AboutContent>
          <h2>About</h2>
          <p>
            Open Eyes tracks goverments&apos; promises and helps citizens hold their politicians accountable. You can
            mark items as accomplished or unaccomplished and they will be categorized accordingly after five other
            people have voted on them.
          </p>
          <h2>Privacy</h2>
          <p>
            Open Eyes requires you to log in with a Google, Facebook or email address in order to prevent abusers voting
            for items more than once. Although Open Eyes uses your email address to identify you, it explicitly avoids
            storing your email address when you log in. Open Eyes obscures the email address before it is stored, in a
            way that cannot be reversed even if the stored data is compromised.
          </p>
        </AboutContent>
      </Content>
    </Root>
  );
}
